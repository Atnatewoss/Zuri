    // == TTS =====================================================
    function estimateSpeechDurationMs(text, rate) {
        const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
        const effectiveRate = Math.max(rate || 1, 0.8);
        const wordsPerMinute = 175 * effectiveRate;
        return Math.max(2500, Math.round((words / wordsPerMinute) * 60000));
    }

    function pickBestVoice(lang) {
        const synth = window.speechSynthesis;
        if (!synth) return null;

        const voices = synth.getVoices();
        if (!voices.length) return null;

        const normalizedLang = String(lang || 'en-US').toLowerCase();
        const langBase = normalizedLang.split('-')[0];
        const matches = voices.filter((voice) => {
            const voiceLang = String(voice.lang || '').toLowerCase();
            return voiceLang === normalizedLang || voiceLang.startsWith(`${langBase}-`) || voiceLang === langBase;
        });
        const candidates = matches.length ? matches : voices;
        const preferredNames = ['google', 'microsoft', 'natural', 'neural', 'samantha', 'daniel'];

        candidates.sort((a, b) => {
            const aName = String(a.name || '').toLowerCase();
            const bName = String(b.name || '').toLowerCase();
            const aScore = preferredNames.findIndex((token) => aName.includes(token));
            const bScore = preferredNames.findIndex((token) => bName.includes(token));
            const aRank = aScore === -1 ? preferredNames.length : aScore;
            const bRank = bScore === -1 ? preferredNames.length : bScore;
            if (aRank !== bRank) return aRank - bRank;
            if (a.localService !== b.localService) return a.localService ? -1 : 1;
            return 0;
        });

        return candidates[0] || null;
    }

    function shouldUseGeminiTTS() {
        return GEMINI_TTS_LANGS.has(langSel.value) || !pickBestVoice(langSel.value);
    }

    function stopRemoteAudioPlayback() {
        if (!remoteAudio) return;
        remoteAudio.pause();
        remoteAudio.src = '';
        remoteAudio = null;
    }

    function shouldUseLiveVoice() {
        return !!(window.WebSocket && (window.AudioContext || window.webkitAudioContext) && navigator.mediaDevices);
    }

    function toBase64FromBytes(bytes) {
        let binary = '';
        for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    }

    function bytesFromBase64(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
        return bytes;
    }

    function downsampleTo16k(float32Buffer, inputRate) {
        if (inputRate === 16000) return float32Buffer;
        const ratio = inputRate / 16000;
        const outputLength = Math.round(float32Buffer.length / ratio);
        const result = new Float32Array(outputLength);
        let offsetResult = 0;
        let offsetBuffer = 0;

        while (offsetResult < result.length) {
            const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
            let accum = 0;
            let count = 0;
            for (let i = offsetBuffer; i < nextOffsetBuffer && i < float32Buffer.length; i += 1) {
                accum += float32Buffer[i];
                count += 1;
            }
            result[offsetResult] = count ? accum / count : 0;
            offsetResult += 1;
            offsetBuffer = nextOffsetBuffer;
        }
        return result;
    }

    function floatTo16BitPCM(float32Buffer) {
        const pcm = new Int16Array(float32Buffer.length);
        for (let i = 0; i < float32Buffer.length; i += 1) {
            const sample = Math.max(-1, Math.min(1, float32Buffer[i]));
            pcm[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        }
        return new Uint8Array(pcm.buffer);
    }

    function resetLiveTurnState() {
        liveUserTranscript = '';
        liveAssistantTranscript = '';
        liveUserCommitted = false;
        liveAssistantCommitted = false;
    }

    function commitLiveUserTranscript() {
        const text = liveUserTranscript.trim();
        if (!text || liveUserCommitted) return;
        addMessage(text, 'user');
        pushChatHistory('user', text);
        liveUserCommitted = true;
    }

    function commitLiveAssistantTranscript() {
        const text = liveAssistantTranscript.trim();
        if (!text || liveAssistantCommitted) return;
        const bookingSignal = parseBookingSignal(text);
        if (bookingSignal) {
            publishBookingSync(bookingSignal);
            addBookingConfirmationCard(bookingSignal);
        }
        addMessage(text, 'ai');
        pushChatHistory('model', text);
        liveAssistantCommitted = true;
    }

    function cleanupLiveInputStream() {
        if (liveProcessorNode) {
            liveProcessorNode.disconnect();
            liveProcessorNode.onaudioprocess = null;
            liveProcessorNode = null;
        }
        if (liveSourceNode) {
            liveSourceNode.disconnect();
            liveSourceNode = null;
        }
        if (liveMediaStream) {
            liveMediaStream.getTracks().forEach((track) => track.stop());
            liveMediaStream = null;
        }
    }

    function closeLiveSocket() {
        if (!liveSocket) return;
        try {
            if (liveSocket.readyState === WebSocket.OPEN) {
                liveSocket.send(JSON.stringify({ type: 'close' }));
            }
            liveSocket.close();
        } catch (_) {}
        liveSocket = null;
    }

    function playLiveAudioChunk(base64, mimeType) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!liveAudioContext) liveAudioContext = new AudioCtx();

        const sampleRateMatch = String(mimeType || '').match(/rate=(\d+)/);
        const sampleRate = sampleRateMatch ? Number(sampleRateMatch[1]) : 24000;
        const bytes = bytesFromBase64(base64);
        const pcm = new Int16Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
        const audioBuffer = liveAudioContext.createBuffer(1, pcm.length, sampleRate);
        const channel = audioBuffer.getChannelData(0);
        for (let i = 0; i < pcm.length; i += 1) channel[i] = pcm[i] / 0x8000;

        const source = liveAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(liveAudioContext.destination);
        const now = liveAudioContext.currentTime;
        livePlaybackTime = Math.max(livePlaybackTime, now + 0.02);
        source.start(livePlaybackTime);
        livePlaybackTime += audioBuffer.duration;
    }

    function buildLiveVoiceUrl() {
        const wsBase = apiUrl.replace(/^http/, 'ws');
        const url = new URL('/api/live-voice/ws', wsBase.endsWith('/') ? wsBase : `${wsBase}/`);
        url.searchParams.set('hotel_id', hotelId);
        url.searchParams.set('language', LANGS.find((l) => l.code === langSel.value)?.name || 'English');
        const history = chatHistory.slice(-6);
        if (history.length) {
            url.searchParams.set('history', btoa(unescape(encodeURIComponent(JSON.stringify(history)))));
        }
        return url.toString();
    }

    async function startLiveVoiceTurn() {
        resetLiveTurnState();
        stopRemoteAudioPlayback();
        closeLiveSocket();
        cleanupLiveInputStream();
        livePlaybackTime = 0;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) throw new Error('AudioContext is not supported in this browser.');
        if (!liveAudioContext) liveAudioContext = new AudioCtx();
        await liveAudioContext.resume();

        liveMediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            },
        });

        liveSocket = new WebSocket(buildLiveVoiceUrl());
        liveSocket.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            if (payload.type === 'setup_complete') {
                voiceStatus.textContent = 'Listening';
                return;
            }
            if (payload.type === 'input_transcript') {
                liveUserTranscript = payload.text || '';
                if (liveUserTranscript) setVoiceCaption(liveUserTranscript, { interim: !payload.finished });
                if (payload.finished) commitLiveUserTranscript();
                return;
            }
            if (payload.type === 'output_transcript') {
                liveAssistantTranscript = payload.text || '';
                orbWrap.className = 'zuri-orb-wrap processing';
                voiceStatus.textContent = 'Speaking';
                if (liveAssistantTranscript) setVoiceCaption(liveAssistantTranscript, { interim: !payload.finished });
                if (payload.finished) commitLiveAssistantTranscript();
                return;
            }
            if (payload.type === 'audio') {
                orbWrap.className = 'zuri-orb-wrap processing';
                voiceStatus.textContent = 'Speaking';
                playLiveAudioChunk(payload.data, payload.mimeType);
                return;
            }
            if (payload.type === 'turn_complete') {
                commitLiveUserTranscript();
                commitLiveAssistantTranscript();
                orbWrap.className = 'zuri-orb-wrap';
                voiceStatus.textContent = 'Ready';
                setVoiceCaption('Tap the orb to speak again');
                closeLiveSocket();
                livePlaybackTime = 0;
                return;
            }
            if (payload.type === 'error') {
                orbWrap.className = 'zuri-orb-wrap';
                voiceStatus.textContent = 'Error';
                setVoiceCaption(payload.message || 'Live voice is unavailable right now.');
                closeLiveSocket();
            }
        };
        liveSocket.onclose = () => {
            cleanupLiveInputStream();
            liveSocket = null;
            if (!voiceModeActive) return;
            if (voiceStatus.textContent === 'Thinking' || orbWrap.classList.contains('processing')) {
                if (liveAssistantTranscript.trim()) {
                    commitLiveAssistantTranscript();
                    voiceStatus.textContent = 'Ready';
                    setVoiceCaption(liveAssistantTranscript.trim());
                } else if (liveUserTranscript.trim()) {
                    voiceStatus.textContent = 'Ready';
                    setVoiceCaption(liveUserTranscript.trim());
                } else {
                    voiceStatus.textContent = 'Ready';
                    setVoiceCaption('Tap the orb to speak again');
                }
                orbWrap.className = 'zuri-orb-wrap';
            }
        };
        liveSocket.onerror = () => {
            orbWrap.className = 'zuri-orb-wrap';
            voiceStatus.textContent = 'Error';
            if (!liveUserTranscript.trim()) {
                setVoiceCaption('Live voice connection failed. Tap to try again.');
            }
        };

        await new Promise((resolve, reject) => {
            liveSocket.onopen = () => resolve();
            const originalOnError = liveSocket.onerror;
            liveSocket.onerror = (event) => {
                if (originalOnError) originalOnError(event);
                reject(new Error('Unable to connect live voice.'));
            };
        });

        liveSourceNode = liveAudioContext.createMediaStreamSource(liveMediaStream);
        liveProcessorNode = liveAudioContext.createScriptProcessor(4096, 1, 1);
        liveProcessorNode.onaudioprocess = (event) => {
            if (!isListening || !liveSocket || liveSocket.readyState !== WebSocket.OPEN) return;
            const inputData = event.inputBuffer.getChannelData(0);
            const downsampled = downsampleTo16k(inputData, liveAudioContext.sampleRate);
            const pcmBytes = floatTo16BitPCM(downsampled);
            liveSocket.send(
                JSON.stringify({
                    type: 'audio',
                    data: toBase64FromBytes(pcmBytes),
                })
            );
        };
        liveSourceNode.connect(liveProcessorNode);
        liveProcessorNode.connect(liveAudioContext.destination);

        isListening = true;
        orbWrap.className = 'zuri-orb-wrap listening';
        voiceStatus.textContent = 'Listening';
        clearVoiceCaptionRotation();
        setVoiceCaption('Speak now...', { interim: true });
    }

    async function speakWithGemini(text, onEnd, onProgress) {
        const selectedLangName = LANGS.find((l) => l.code === langSel.value)?.name || 'English';
        const res = await fetch(`${apiUrl}/api/speech/synthesize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Zuri-Hotel-Id': hotelId,
            },
            body: JSON.stringify({
                text,
                language: selectedLangName,
            }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new Error(data?.detail || 'Unable to generate voice right now.');
        }

        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        remoteAudio = audio;
        const estimatedDurationMs = estimateSpeechDurationMs(text, 1);
        onProgress && onProgress(-1, estimatedDurationMs);

        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            if (remoteAudio === audio) remoteAudio = null;
            onEnd && onEnd();
        };
        audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            if (remoteAudio === audio) remoteAudio = null;
            onEnd && onEnd();
        };
        await audio.play();
    }

    function speak(text, onEnd, onProgress) {
        if (shouldUseGeminiTTS()) {
            stopRemoteAudioPlayback();
            speakWithGemini(text, onEnd, onProgress).catch(() => {
                if (onEnd) onEnd();
            });
            return;
        }
        if (!window.speechSynthesis) { if (onEnd) onEnd(); return; }
        window.speechSynthesis.cancel();
        const clean = text.replace(/[*_`#\[\]()>~]/g, '').replace(/<[^>]+>/g, '');
        const utter = new SpeechSynthesisUtterance(clean);
        utter.lang = langSel.value;
        utter.rate = 1.08;
        utter.pitch = 1.02;
        const preferredVoice = pickBestVoice(langSel.value);
        if (preferredVoice) utter.voice = preferredVoice;
        const estimatedDurationMs = estimateSpeechDurationMs(clean, utter.rate);
        let usedBoundaryEvents = false;
        if (onProgress) onProgress(-1, estimatedDurationMs);
        utter.onboundary = (event) => {
            if (event.name === 'word' || typeof event.charIndex === 'number') {
                usedBoundaryEvents = true;
                onProgress && onProgress(event.charIndex, estimatedDurationMs);
            }
        };
        utter.onend = () => { if (onEnd) onEnd(); };
        utter.onerror = () => {
            if (!usedBoundaryEvents && onProgress) onProgress(-1, estimatedDurationMs);
            if (onEnd) onEnd();
        };
        window.speechSynthesis.speak(utter);
    }

    // == STT =====================================================
    const GEMINI_TRANSCRIBE_LANGS = new Set(['ar-SA', 'am-ET', 'ti-ET', 'om-ET', 'so-SO']);
    const GEMINI_TTS_LANGS = new Set(['ar-SA', 'am-ET', 'ti-ET', 'om-ET', 'so-SO']);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let isListening = false;
    let voiceModeActive = false;
    let accumulatedTranscript = '';
    let mediaRecorder = null;
    let mediaRecorderChunks = [];
    let mediaRecorderStream = null;
    let pendingVoiceTranscription = false;
    let remoteAudio = null;
    let liveSocket = null;
    let liveAudioContext = null;
    let liveMediaStream = null;
    let liveSourceNode = null;
    let liveProcessorNode = null;
    let livePlaybackTime = 0;
    let liveUserTranscript = '';
    let liveAssistantTranscript = '';
    let liveUserCommitted = false;
    let liveAssistantCommitted = false;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            let interim = '';
            let finalChunk = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) { finalChunk += t; } else { interim += t; }
            }

            // Live caption — shows Ge'ez / Latin in real-time for trust
            if (interim) {
                clearVoiceCaptionRotation();
                setVoiceCaption((accumulatedTranscript + ' ' + interim).trim(), { interim: true });
                voiceStatus.textContent = 'Listening (Tap orb to send)';
            }

            if (finalChunk) {
                accumulatedTranscript += ' ' + finalChunk;
                clearVoiceCaptionRotation();
                setVoiceCaption(accumulatedTranscript.trim());
                voiceStatus.textContent = 'Ready (Tap orb to send)';
            }
        };

        recognition.onerror = (e) => {
            console.warn('Speech error:', e.error);
            if (e.error === 'no-speech') {
                // Ignore silent timeouts in push-to-talk
            } else if (e.error !== 'aborted') {
                voiceStatus.textContent = 'Error — tap to retry';
                stopListening();
            }
        };

        recognition.onend = () => {
            // Auto-restart if we're still in voice mode and still listening natively
            if (voiceModeActive && isListening) {
                try { recognition.start(); } catch(e) {}
            }
        };
    }

    function shouldUseGeminiTranscription() {
        return GEMINI_TRANSCRIBE_LANGS.has(langSel.value) || !recognition;
    }

    function clearMediaRecorderState() {
        mediaRecorder = null;
        mediaRecorderChunks = [];
        if (mediaRecorderStream) {
            mediaRecorderStream.getTracks().forEach((track) => track.stop());
            mediaRecorderStream = null;
        }
    }

    async function transcribeCapturedAudio(blob) {
        const selectedLangName = LANGS.find((l) => l.code === langSel.value)?.name || 'English';
        const formData = new FormData();
        formData.append('audio', blob, `voice-input.${blob.type.includes('webm') ? 'webm' : 'wav'}`);
        formData.append('language', selectedLangName);

        const res = await fetch(`${apiUrl}/api/speech/transcribe`, {
            method: 'POST',
            headers: { 'X-Zuri-Hotel-Id': hotelId },
            body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.detail || 'Unable to transcribe speech right now.');
        }
        return String(data?.text || '').trim();
    }

    async function startGeminiListening() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderStream = stream;
        mediaRecorderChunks = [];

        const preferredMimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
        const selectedMimeType = preferredMimeTypes.find((mime) => window.MediaRecorder && MediaRecorder.isTypeSupported(mime));
        mediaRecorder = selectedMimeType
            ? new MediaRecorder(stream, { mimeType: selectedMimeType })
            : new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                mediaRecorderChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            isListening = false;
            pendingVoiceTranscription = true;
            orbWrap.className = 'zuri-orb-wrap processing';
            voiceStatus.textContent = 'Transcribing';
            setVoiceCaption('Processing your speech...');

            try {
                const blob = new Blob(mediaRecorderChunks, {
                    type: mediaRecorder.mimeType || 'audio/webm',
                });
                const transcript = await transcribeCapturedAudio(blob);
                accumulatedTranscript = transcript;
                if (!transcript) {
                    voiceStatus.textContent = 'Idle';
                    setVoiceCaption('No speech detected. Tap the orb to try again.');
                    return;
                }
                setVoiceCaption(transcript);
                voiceStatus.textContent = 'Sending';
                const message = transcript;
                accumulatedTranscript = '';
                sendMessage(message, { fromVoice: true });
            } catch (error) {
                voiceStatus.textContent = 'Error';
                setVoiceCaption(
                    error instanceof Error ? error.message : 'Speech transcription failed. Tap the orb to try again.'
                );
                orbWrap.className = 'zuri-orb-wrap';
            } finally {
                pendingVoiceTranscription = false;
                clearMediaRecorderState();
            }
        };

        isListening = true;
        orbWrap.className = 'zuri-orb-wrap listening';
        voiceStatus.textContent = 'Listening (Tap orb to send)';
        clearVoiceCaptionRotation();
        setVoiceCaption('Speak now...', { interim: true });
        mediaRecorder.start();
    }

    function startListening() {
        if (shouldUseLiveVoice()) {
            startLiveVoiceTurn().catch((error) => {
                isListening = false;
                cleanupLiveInputStream();
                closeLiveSocket();
                voiceStatus.textContent = 'Error';
                setVoiceCaption(error instanceof Error ? error.message : 'Unable to start live voice.');
                orbWrap.className = 'zuri-orb-wrap';
            });
            return;
        }

        if (shouldUseGeminiTranscription()) {
            if (!navigator.mediaDevices || !window.MediaRecorder) {
                voiceStatus.textContent = 'Unavailable';
                setVoiceCaption('Voice input is not supported in this browser.');
                return;
            }
            startGeminiListening().catch((error) => {
                isListening = false;
                clearMediaRecorderState();
                voiceStatus.textContent = 'Error';
                setVoiceCaption(
                    error instanceof Error ? error.message : 'Unable to access microphone.'
                );
                orbWrap.className = 'zuri-orb-wrap';
            });
            return;
        }

        if (!recognition) return;
        isListening = true;
        accumulatedTranscript = '';
        recognition.lang = langSel.value;
        orbWrap.className = 'zuri-orb-wrap listening';
        voiceStatus.textContent = 'Listening (Tap orb to send)';
        clearVoiceCaptionRotation();
        setVoiceCaption('Speak now...', { interim: true });
        try { recognition.start(); } catch(e) {}
    }

    function stopListening() {
        if (shouldUseLiveVoice()) {
            isListening = false;
            cleanupLiveInputStream();
            orbWrap.className = 'zuri-orb-wrap processing';
            voiceStatus.textContent = 'Thinking';
            setVoiceCaption(liveUserTranscript.trim() || 'Thinking...');
            if (liveSocket && liveSocket.readyState === WebSocket.OPEN) {
                liveSocket.send(JSON.stringify({ type: 'end' }));
            }
            return;
        }

        if (shouldUseGeminiTranscription()) {
            isListening = false;
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            } else {
                clearMediaRecorderState();
                orbWrap.className = 'zuri-orb-wrap';
            }
            return;
        }

        isListening = false;
        orbWrap.className = 'zuri-orb-wrap';
        try { recognition.stop(); } catch(e) {}
    }

    // == Voice Mode (Overlay) ====================================
    function enterVoiceMode() {
        if (!shouldUseLiveVoice() && !SpeechRecognition && (!navigator.mediaDevices || !window.MediaRecorder)) {
            alert('Voice input is not supported in this browser. Please use Google Chrome.');
            return;
        }
        voiceModeActive = true;
        const lang = LANGS.find(l => l.code === langSel.value);
        voiceLangLbl.textContent = lang ? `${lang.flag} ${lang.name}` : 'English';
        voiceOverlay.classList.add('active');
        
        // Start in idle mode, wait for tap
        orbWrap.className = 'zuri-orb-wrap';
        voiceStatus.textContent = 'Ready';
        clearVoiceCaptionRotation();
        setVoiceCaption('Tap the orb to start speaking...');
        accumulatedTranscript = '';
    }

    function exitVoiceMode() {
        voiceModeActive = false;
        stopListening();
        cleanupLiveInputStream();
        closeLiveSocket();
        livePlaybackTime = 0;
        stopRemoteAudioPlayback();
        window.speechSynthesis && window.speechSynthesis.cancel();
        clearVoiceCaptionRotation();
        voiceOverlay.classList.remove('active');
        // All ghost messages become solid when exiting voice
        msgBox.querySelectorAll('.ghost').forEach(el => resolveGhost(el));
    }

    micBtn.onclick = () => enterVoiceMode();
    voiceClose.onclick = () => exitVoiceMode();
    stopVoice.onclick = () => exitVoiceMode();

    // Push-to-talk mechanic on the orb
    orbWrap.style.cursor = 'pointer';
    orbWrap.onclick = () => {
        if (orbWrap.classList.contains('processing') || pendingVoiceTranscription) return; // Ignore while processing backend

        if (isListening) {
            // Stop & Send
            stopListening();
            if (!shouldUseGeminiTranscription() && accumulatedTranscript.trim()) {
                const msg = accumulatedTranscript.trim();
                accumulatedTranscript = '';
                sendMessage(msg, { fromVoice: true });
            } else if (!shouldUseGeminiTranscription()) {
                voiceStatus.textContent = 'Idle';
                setVoiceCaption('Tap the orb to start speaking...');
            }
        } else {
            // Start
            startListening();
        }
    };

    // Update language label when changed
    langSel.onchange = () => {
        const lang = LANGS.find(l => l.code === langSel.value);
        voiceLangLbl.textContent = lang ? `${lang.flag} ${lang.name}` : 'English';
    };

    if (cancelModalInput) {
        cancelModalInput.oninput = () => {
            if (cancelModalError) cancelModalError.textContent = '';
            syncCancelModalState();
        };
        cancelModalInput.onkeydown = (e) => {
            if (e.key === 'Enter' && cancelModalConfirm && !cancelModalConfirm.disabled) {
                e.preventDefault();
                cancelModalConfirm.click();
            }
        };
    }

    if (cancelModalClose) {
        cancelModalClose.onclick = () => closeCancelModal();
    }

    if (cancelModalConfirm) {
        cancelModalConfirm.onclick = () => {
            if (!pendingCancellationCode || !cancelModalInput) return;
            const guestName = cancelModalInput.value.trim();
            if (!guestName) {
                syncCancelModalState();
                return;
            }
            cancelModalConfirm.disabled = true;
            cancelBookingFromWidget(pendingCancellationCode, guestName);
        };
    }

    if (cancelModal) {
        cancelModal.onclick = (e) => {
            if (e.target === cancelModal) closeCancelModal();
        };
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cancelModal && cancelModal.classList.contains('show')) {
            closeCancelModal();
        }
    });

})();
