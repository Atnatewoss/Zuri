(function() {
    // == Config ==================================================
    const scriptTag = document.currentScript;
    const hotelId   = scriptTag.getAttribute('data-hotel-id');
    const apiUrl    = scriptTag.getAttribute('data-api-url') || 'http://localhost:8000';
    if (!hotelId) { console.error('Zuri widget: missing data-hotel-id'); return; }

    const LANGS = [
        { code: 'en-US', label: 'EN',  flag: '🇬🇧', name: 'English' },
        { code: 'am-ET', label: 'አማ',  flag: '🇪🇹', name: 'Amharic' },
        { code: 'ti-ET', label: 'ትግ',  flag: '🇪🇷', name: 'Tigrinya' },
        { code: 'om-ET', label: 'ኦሮ',  flag: '🇪🇹', name: 'Oromifa' },
        { code: 'so-SO', label: 'So',  flag: '🇸🇴', name: 'Somali' },
        { code: 'ar-SA', label: 'عر',  flag: '🇸🇦', name: 'Arabic' },
        { code: 'fr-FR', label: 'FR',  flag: '🇫🇷', name: 'French' },
        { code: 'it-IT', label: 'IT',  flag: '🇮🇹', name: 'Italian' },
    ];

    // == Lightweight Markdown ====================================
    function md(t) {
        if (!t) return '';
        return t
            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>')
            .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
            .replace(/<\/ul>\s*<ul>/g, '')
            .replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>')
            .replace(/\n/g, '<br>');
    }

    // == Styles ==================================================
    const css = `
    #zuri-widget-container{position:fixed;bottom:20px;right:20px;z-index:999999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}

    /* Bubble */
    #zuri-bubble{width:60px;height:60px;background:#1a1a1a;border-radius:50%;box-shadow:0 4px 14px rgba(0,0,0,.25);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s}
    #zuri-bubble:hover{transform:scale(1.1)}
    #zuri-bubble svg{width:28px;height:28px;fill:#fff}

    /* Chat Window */
    #zuri-chat-window{position:absolute;bottom:80px;right:0;width:380px;height:560px;background:#fff;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.18);display:none;flex-direction:column;overflow:hidden;border:1px solid #e5e5e5}
    #zuri-chat-header{background:#1a1a1a;color:#fff;padding:14px 18px;display:flex;justify-content:space-between;align-items:center}
    #zuri-chat-header h3{margin:0;font-size:15px;font-weight:600;letter-spacing:.3px}
    #zuri-close-btn{cursor:pointer;font-size:22px;opacity:.7;transition:opacity .2s;background:none;border:none;color:white}
    #zuri-close-btn:hover{opacity:1}

    /* Messages */
    #zuri-messages{flex:1;padding:16px;overflow-y:auto;background:#f7f7f8;display:flex;flex-direction:column;gap:10px}
    .zuri-msg{padding:10px 14px;border-radius:14px;max-width:82%;font-size:13.5px;line-height:1.55;word-wrap:break-word;animation:zuri-fade .25s ease}
    .zuri-msg.user{background:#1a1a1a;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
    .zuri-msg.ai{background:#fff;color:#222;border:1px solid #e8e8e8;align-self:flex-start;border-bottom-left-radius:4px}
    .zuri-msg.ai strong{font-weight:700}
    .zuri-msg.ai code{background:#f0f0f0;padding:1px 5px;border-radius:4px;font-size:12px;font-family:monospace}
    .zuri-msg.ai pre{background:#1a1a1a;color:#e0e0e0;padding:10px;border-radius:8px;overflow-x:auto;margin:6px 0}
    .zuri-msg.ai pre code{background:none;color:inherit;padding:0}
    .zuri-msg.ai ul,.zuri-msg.ai ol{margin:4px 0;padding-left:18px}
    .zuri-msg.ai li{margin:2px 0}
    .zuri-msg .zuri-speak-btn{display:inline-flex;cursor:pointer;opacity:.4;margin-left:4px;font-size:13px;transition:opacity .2s;vertical-align:middle;background:none;border:none;padding:0}
    .zuri-msg .zuri-speak-btn:hover{opacity:1}
    .zuri-msg.ghost{opacity:.5;transition:opacity .4s}
    .zuri-msg.ghost.resolved{opacity:1}
    @keyframes zuri-fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

    /* Input Bar */
    #zuri-input-area{padding:10px 12px;border-top:1px solid #eee;display:flex;gap:6px;align-items:center;background:#fff}
    #zuri-lang-sel{width:56px;border:1px solid #ddd;border-radius:8px;padding:7px 2px;font-size:13px;outline:none;cursor:pointer;background:#fafafa;text-align:center}
    #zuri-input{flex:1;border:1px solid #ddd;border-radius:10px;padding:9px 12px;outline:none;font-size:13.5px;transition:border-color .2s}
    #zuri-input:focus{border-color:#1a1a1a}
    .zuri-icon-btn{width:36px;height:36px;border:none;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
    #zuri-send-btn{background:#1a1a1a}
    #zuri-send-btn svg{width:16px;height:16px;fill:#fff}
    #zuri-mic-btn{background:#f0f0f0}
    #zuri-mic-btn svg{width:18px;height:18px;fill:#555}

    /* == Voice Overlay (Gemini Live Style) ====================== */
    #zuri-voice-overlay{position:absolute;inset:0;background:linear-gradient(145deg,#0f0f0f 0%,#1a1a2e 50%,#16213e 100%);display:none;flex-direction:column;align-items:center;justify-content:center;z-index:10;border-radius:16px;overflow:hidden}
    #zuri-voice-overlay.active{display:flex}

    .zuri-voice-close{position:absolute;top:14px;right:18px;background:rgba(255,255,255,.1);border:none;color:rgba(255,255,255,.7);font-size:20px;cursor:pointer;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all .2s}
    .zuri-voice-close:hover{background:rgba(255,255,255,.2);color:#fff}

    .zuri-voice-lang{position:absolute;top:16px;left:18px;color:rgba(255,255,255,.5);font-size:11px;letter-spacing:1px;text-transform:uppercase}

    /* Orb animation */
    .zuri-orb-wrap{position:relative;width:120px;height:120px;margin-bottom:32px}
    .zuri-orb{width:120px;height:120px;border-radius:50%;background:radial-gradient(circle at 35% 35%,rgba(99,102,241,.6),rgba(139,92,246,.3),transparent 70%);position:relative;display:flex;align-items:center;justify-content:center}
    .zuri-orb svg{width:40px;height:40px;fill:rgba(255,255,255,.9)}
    .zuri-ring{position:absolute;inset:-8px;border-radius:50%;border:2px solid rgba(139,92,246,.25)}

    .zuri-orb-wrap.listening .zuri-orb{animation:zuri-breathe 1.5s ease-in-out infinite}
    .zuri-orb-wrap.listening .zuri-ring{animation:zuri-ring-pulse 1.5s ease-in-out infinite}
    .zuri-orb-wrap.processing .zuri-orb{animation:zuri-spin-glow 1.2s linear infinite}

    @keyframes zuri-breathe{0%,100%{transform:scale(1);box-shadow:0 0 30px rgba(99,102,241,.2)}50%{transform:scale(1.08);box-shadow:0 0 50px rgba(139,92,246,.35)}}
    @keyframes zuri-ring-pulse{0%,100%{transform:scale(1);opacity:.3}50%{transform:scale(1.12);opacity:.6}}
    @keyframes zuri-spin-glow{0%{box-shadow:0 0 20px rgba(99,102,241,.3);transform:rotate(0deg) scale(1)}50%{box-shadow:0 0 40px rgba(139,92,246,.5);transform:rotate(180deg) scale(1.04)}100%{box-shadow:0 0 20px rgba(99,102,241,.3);transform:rotate(360deg) scale(1)}}

    /* Live caption */
    .zuri-live-caption{color:rgba(255,255,255,.85);font-size:15px;text-align:center;max-width:85%;min-height:24px;line-height:1.5;transition:opacity .2s;padding:0 10px}
    .zuri-live-caption.interim{color:rgba(255,255,255,.5);font-style:italic}

    .zuri-voice-status{color:rgba(255,255,255,.35);font-size:11px;margin-top:16px;letter-spacing:.5px;text-transform:uppercase}

    /* Stop button */
    .zuri-stop-btn{margin-top:28px;width:48px;height:48px;border-radius:50%;background:rgba(239,68,68,.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;box-shadow:0 4px 15px rgba(239,68,68,.3)}
    .zuri-stop-btn:hover{transform:scale(1.1);box-shadow:0 4px 20px rgba(239,68,68,.5)}
    .zuri-stop-btn .stop-square{width:16px;height:16px;background:#fff;border-radius:3px}
    `;
    const sEl = document.createElement('style');
    sEl.textContent = css;
    document.head.appendChild(sEl);

    // == DOM ======================================================
    const langOptions = LANGS.map(l => `<option value="${l.code}">${l.flag} ${l.label}</option>`).join('');

    const container = document.createElement('div');
    container.id = 'zuri-widget-container';
    container.innerHTML = `
        <div id="zuri-chat-window">
            <div id="zuri-chat-header">
                <h3>✦ Zuri AI Concierge</h3>
                <button id="zuri-close-btn">&times;</button>
            </div>
            <div id="zuri-messages">
                <div class="zuri-msg ai">Hello! I'm Zuri, your AI concierge. How can I help you today?</div>
            </div>
            <div id="zuri-input-area">
                <select id="zuri-lang-sel">${langOptions}</select>
                <input type="text" id="zuri-input" placeholder="Type a message...">
                <button id="zuri-mic-btn" class="zuri-icon-btn" title="Voice mode">
                    <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                </button>
                <button id="zuri-send-btn" class="zuri-icon-btn" title="Send">
                    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
            </div>

            <!-- Voice Overlay (Gemini Live-style) -->
            <div id="zuri-voice-overlay">
                <button class="zuri-voice-close" id="zuri-voice-close">&times;</button>
                <div class="zuri-voice-lang" id="zuri-voice-lang-label">English</div>
                <div class="zuri-orb-wrap" id="zuri-orb-wrap">
                    <div class="zuri-ring"></div>
                    <div class="zuri-orb">
                        <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                    </div>
                </div>
                <div class="zuri-live-caption" id="zuri-live-caption">Tap the mic and start speaking...</div>
                <div class="zuri-voice-status" id="zuri-voice-status">Listening</div>
                <button class="zuri-stop-btn" id="zuri-stop-voice"><div class="stop-square"></div></button>
            </div>
        </div>
        <div id="zuri-bubble">
            <svg viewBox="0 0 24 24"><path d="M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z"/></svg>
        </div>
    `;
    document.body.appendChild(container);

    // == Element Refs =============================================
    const bubble      = document.getElementById('zuri-bubble');
    const chatWin     = document.getElementById('zuri-chat-window');
    const closeBtn    = document.getElementById('zuri-close-btn');
    const input       = document.getElementById('zuri-input');
    const sendBtn     = document.getElementById('zuri-send-btn');
    const micBtn      = document.getElementById('zuri-mic-btn');
    const langSel     = document.getElementById('zuri-lang-sel');
    const msgBox      = document.getElementById('zuri-messages');
    const voiceOverlay = document.getElementById('zuri-voice-overlay');
    const voiceClose  = document.getElementById('zuri-voice-close');
    const orbWrap     = document.getElementById('zuri-orb-wrap');
    const liveCaption = document.getElementById('zuri-live-caption');
    const voiceStatus = document.getElementById('zuri-voice-status');
    const stopVoice   = document.getElementById('zuri-stop-voice');
    const voiceLangLbl = document.getElementById('zuri-voice-lang-label');

    // == Toggle Chat =============================================
    bubble.onclick   = () => { chatWin.style.display = chatWin.style.display === 'flex' ? 'none' : 'flex'; };
    closeBtn.onclick = () => { chatWin.style.display = 'none'; exitVoiceMode(); };

    // == Message Helpers =========================================
    function addMessage(text, type, opts = {}) {
        const div = document.createElement('div');
        div.className = `zuri-msg ${type}`;
        if (opts.ghost) div.classList.add('ghost');

        if (type === 'ai' && !opts.raw) {
            let html = md(text);
            html += ` <button class="zuri-speak-btn" title="Listen">🔊</button>`;
            div.innerHTML = html;
            const speakBtn = div.querySelector('.zuri-speak-btn');
            if (speakBtn) speakBtn.onclick = () => speak(text);
        } else {
            div.textContent = text;
        }
        msgBox.appendChild(div);
        msgBox.scrollTop = msgBox.scrollHeight;
        return div;
    }

    function resolveGhost(el) {
        if (el) { el.classList.remove('ghost'); el.classList.add('resolved'); }
    }

    // == Send Message (unified pipeline for text & voice) ========
    async function sendMessage(text, opts = {}) {
        text = (text || input.value).trim();
        if (!text) return;

        // Ghost-write the user message (dim if from voice mode)
        const userBubble = addMessage(text, 'user', { ghost: opts.fromVoice });
        input.value = '';

        // Ghost-write a loader
        const loader = addMessage('...', 'ai', { raw: true, ghost: opts.fromVoice });

        // Update voice overlay if active
        if (opts.fromVoice && voiceOverlay.classList.contains('active')) {
            orbWrap.className = 'zuri-orb-wrap processing';
            voiceStatus.textContent = 'Thinking';
            liveCaption.textContent = '';
            liveCaption.className = 'zuri-live-caption';
        }

        try {
            const selectedLangName = LANGS.find(l => l.code === langSel.value)?.name || 'English';
            const res = await fetch(`${apiUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Zuri-Hotel-Id': hotelId },
                body: JSON.stringify({ message: text, hotel_id: hotelId, language: selectedLangName })
            });
            const data = await res.json();
            msgBox.removeChild(loader);
            resolveGhost(userBubble);

            const aiText = data.response || 'Sorry, something went wrong.';
            const aiBubble = addMessage(aiText, 'ai', { ghost: opts.fromVoice });

            // If in voice mode: speak the response, show it as live caption
            if (opts.fromVoice && voiceOverlay.classList.contains('active')) {
                liveCaption.textContent = aiText.substring(0, 120) + (aiText.length > 120 ? '...' : '');
                liveCaption.className = 'zuri-live-caption';
                voiceStatus.textContent = 'Speaking';
                speak(aiText, () => {
                    resolveGhost(aiBubble);
                    // Go idle instead of auto-resuming
                    if (voiceOverlay.classList.contains('active')) {
                        orbWrap.className = 'zuri-orb-wrap';
                        voiceStatus.textContent = 'Idle';
                        liveCaption.textContent = 'Tap the orb to speak again';
                    }
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
                liveCaption.textContent = 'Tap the orb to try again';
            }
        }
    }

    sendBtn.onclick = () => sendMessage();
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

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
                liveCaption.textContent = accumulatedTranscript + ' ' + interim;
                liveCaption.className = 'zuri-live-caption interim';
                voiceStatus.textContent = 'Listening (Tap orb to send)';
            }

            if (finalChunk) {
                accumulatedTranscript += ' ' + finalChunk;
                liveCaption.textContent = accumulatedTranscript.trim();
                liveCaption.className = 'zuri-live-caption';
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
        liveCaption.textContent = 'Speak now...';
        liveCaption.className = 'zuri-live-caption interim';
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
        liveCaption.textContent = 'Tap the orb to start speaking...';
        accumulatedTranscript = '';
    }

    function exitVoiceMode() {
        voiceModeActive = false;
        stopListening();
        window.speechSynthesis && window.speechSynthesis.cancel();
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
                liveCaption.textContent = 'Tap the orb to start speaking...';
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
