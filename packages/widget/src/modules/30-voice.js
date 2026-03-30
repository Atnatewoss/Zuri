    // == TTS =====================================================
    function speak(text, onEnd) {
        if (!window.speechSynthesis) { if (onEnd) onEnd(); return; }
        window.speechSynthesis.cancel();
        const clean = text.replace(/[*_`#\[\]()>~]/g, '').replace(/<[^>]+>/g, '');
        const utter = new SpeechSynthesisUtterance(clean);
        utter.lang = langSel.value;
        utter.rate = 0.95;
        utter.onend = () => { if (onEnd) onEnd(); };
        utter.onerror = () => { if (onEnd) onEnd(); };
        window.speechSynthesis.speak(utter);
    }

    // == STT =====================================================
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let isListening = false;
    let voiceModeActive = false;
    let accumulatedTranscript = '';

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

    function startListening() {
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
        isListening = false;
        orbWrap.className = 'zuri-orb-wrap';
        try { recognition.stop(); } catch(e) {}
    }

    // == Voice Mode (Overlay) ====================================
    function enterVoiceMode() {
        if (!SpeechRecognition) {
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
        if (orbWrap.classList.contains('processing')) return; // Ignore while processing backend
        
        if (isListening) {
            // Stop & Send
            stopListening();
            if (accumulatedTranscript.trim()) {
                const msg = accumulatedTranscript.trim();
                accumulatedTranscript = '';
                sendMessage(msg, { fromVoice: true });
            } else {
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

})();
