    // == Send Message (unified pipeline for text & voice) ========
    async function sendMessage(text, opts = {}) {
        text = (text || input.value).trim();
        if (!text) return;

        // Ghost-write the user message (dim if from voice mode)
        const userBubble = addMessage(text, 'user', { ghost: opts.fromVoice });
        pushChatHistory('user', text);
        input.value = '';

        // Ghost-write a loader
        const loader = addMessage('...', 'ai', { raw: true, ghost: opts.fromVoice });

        // Update voice overlay if active
        if (opts.fromVoice && voiceOverlay.classList.contains('active')) {
            orbWrap.className = 'zuri-orb-wrap processing';
            voiceStatus.textContent = 'Thinking';
            clearVoiceCaptionRotation();
            setVoiceCaption('');
        }

        try {
            const selectedLangName = LANGS.find(l => l.code === langSel.value)?.name || 'English';
            const res = await fetch(`${apiUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Zuri-Hotel-Id': hotelId },
                body: JSON.stringify({
                    message: text,
                    hotel_id: hotelId,
                    language: selectedLangName,
                    conversation_history: chatHistory.slice(-7, -1),
                })
            });
            const data = await res.json();
            msgBox.removeChild(loader);
            resolveGhost(userBubble);

            const aiText = data.response || 'Sorry, something went wrong.';
            const bookingSignal = parseBookingSignal(aiText);
            if (bookingSignal) {
                publishBookingSync(bookingSignal);
                addBookingConfirmationCard(bookingSignal);
            }
            const aiBubble = addMessage(aiText, 'ai', { ghost: opts.fromVoice });
            pushChatHistory('model', aiText);

            // If in voice mode: speak the response, show it as live caption
            if (opts.fromVoice && voiceOverlay.classList.contains('active')) {
                voiceStatus.textContent = 'Speaking';
                const spokenText = toSpokenText(aiText);
                const captionChunks = splitCaptionChunks(spokenText);
                if (captionChunks.length) {
                    setVoiceCaption(captionChunks[0].text);
                }
                speak(spokenText, () => {
                    clearVoiceCaptionRotation();
                    resolveGhost(aiBubble);
                    // Go idle instead of auto-resuming
                    if (voiceOverlay.classList.contains('active')) {
                        orbWrap.className = 'zuri-orb-wrap';
                        voiceStatus.textContent = 'Idle';
                        setVoiceCaption('Tap the orb to speak again');
                    }
                }, (charIndex, estimatedDurationMs) => {
                    if (!captionChunks.length) return;
                    if (typeof charIndex === 'number' && charIndex >= 0) {
                        setVoiceCaption(getCaptionChunkForChar(captionChunks, charIndex));
                        return;
                    }
                    rotateVoiceCaption(spokenText, estimatedDurationMs);
                });
            } else {
                resolveGhost(aiBubble);
            }
        } catch (err) {
            msgBox.removeChild(loader);
            resolveGhost(userBubble);
            addMessage("Sorry, I'm having trouble connecting right now.", 'ai');
            if (opts.fromVoice && voiceOverlay.classList.contains('active')) {
                orbWrap.className = 'zuri-orb-wrap';
                voiceStatus.textContent = 'Idle';
                clearVoiceCaptionRotation();
                setVoiceCaption('Tap the orb to try again');
            }
        }
    }

    sendBtn.onclick = () => sendMessage();
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

