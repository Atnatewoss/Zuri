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

    /* == Voice Overlay (Premium Avatar Style) ================== */
    #zuri-voice-overlay{position:absolute;inset:0;background:linear-gradient(145deg,#050505 0%,#0a0a1a 50%,#050a1a 100%);display:none;flex-direction:column;align-items:center;justify-content:center;z-index:10;border-radius:16px;overflow:hidden;backdrop-filter:blur(10px)}
    #zuri-voice-overlay.active{display:flex}
    
    .zuri-voice-close{position:absolute;top:14px;right:18px;background:rgba(255,255,255,.05);border:none;color:rgba(255,255,255,.5);font-size:20px;cursor:pointer;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all .2s;z-index:11}
    .zuri-voice-close:hover{background:rgba(255,255,255,.15);color:#fff;transform:rotate(90deg)}

    .zuri-voice-lang{position:absolute;top:16px;left:18px;color:rgba(255,255,255,.4);font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase}

    /* Avatar Animation System */
    .zuri-avatar-wrap{position:relative;width:180px;height:180px;margin-bottom:40px;display:flex;align-items:center;justify-content:center;cursor:pointer}
    .zuri-avatar-glow{position:absolute;inset:-20px;background:radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%);border-radius:50%;filter:blur(20px);opacity:0;transition:opacity .5s}
    .zuri-avatar-wrap.listening .zuri-avatar-glow{opacity:1;animation:zuri-glow-pulse 2s ease-in-out infinite}
    
    .zuri-avatar-ring{position:absolute;inset:-5px;border:1px solid rgba(255,255,255,0.1);border-radius:50%;transition:all .5s}
    .zuri-avatar-wrap.listening .zuri-avatar-ring{inset:-15px;border-color:rgba(99,102,241,0.3);animation:zuri-ring-spin 8s linear infinite}
    
    .zuri-orb{width:140px;height:140px;border-radius:50%;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;position:relative;z-index:2;transition:all .3s;box-shadow:0 0 40px rgba(0,0,0,0.5)}
    .zuri-avatar-wrap.talking .zuri-orb{transform:scale(1.05);border-color:rgba(255,255,255,0.3);box-shadow:0 0 60px rgba(99,102,241,0.2)}
    
    #zuri-avatar-body{transition:transform .2s ease;filter:drop-shadow(0 0 10px rgba(255,255,255,0.1))}
    .zuri-avatar-wrap.talking #zuri-avatar-body{animation:zuri-mouth-move .2s infinite alternate}

    @keyframes zuri-glow-pulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.8;transform:scale(1.2)}}
    @keyframes zuri-ring-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes zuri-mouth-move{from{transform:scaleY(1)}to{transform:scaleY(1.08)}}

    /* Live caption */
    .zuri-live-caption{color:rgba(255,255,255,.9);font-size:16px;font-weight:400;text-align:center;max-width:85%;min-height:28px;line-height:1.6;transition:opacity .3s;padding:0 20px;font-family:serif;font-style:italic}
    .zuri-live-caption.interim{color:rgba(255,255,255,.4)}

    .zuri-voice-status{color:rgba(255,255,255,.25);font-size:10px;font-weight:800;margin-top:20px;letter-spacing:2px;text-transform:uppercase}

    /* Stop button */
    .zuri-stop-btn{margin-top:32px;width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s}
    .zuri-stop-btn:hover{background:rgba(239,68,68,.2);border-color:rgba(239,68,68,.4);transform:scale(1.1)}
    .zuri-stop-btn .stop-square{width:14px;height:14px;background:rgba(255,255,255,.6);border-radius:2px}
    .zuri-stop-btn:hover .stop-square{background:rgba(239,68,68,1)}
    `;
    const sEl = document.createElement('style');
    sEl.textContent = css;
    document.head.appendChild(sEl);

    // == DOM ======================================================
    const langOptions = LANGS.map(l => `<option value="${l.code}">${l.flag} ${l.label}</option>`).join('');

    let resortSettings = {
        avatarClothing: 'Suit',
        avatarColor: '#1a1a1a',
        avatarSkinTone: 'Neutral'
    };

    async function fetchResortSettings() {
        try {
            const res = await fetch(`${apiUrl}/api/settings?hotel_id=${encodeURIComponent(hotelId)}`);
            if (res.ok) {
                const data = await res.ok ? await res.json() : {};
                resortSettings = {
                    avatarClothing: data.avatar_clothing || 'Suit',
                    avatarColor: data.avatar_color || '#1a1a1a',
                    avatarSkinTone: data.avatar_skin_tone || 'Neutral'
                };
                updateAvatarUI();
            }
        } catch (e) { console.warn('Zuri: failed to fetch settings', e); }
    }

    function updateAvatarUI() {
        const avatarEl = document.getElementById('zuri-avatar-body');
        if (!avatarEl) return;
        
        // Update to DiceBear SVG
        const clothing = resortSettings.avatarClothing === 'Suit' ? 'blazerAndShirt' : 
                          resortSettings.avatarClothing === 'Casual' ? 'collarAndSweater' : 'graphicShirt';
        const skinHex = resortSettings.avatarSkinTone === 'Light' ? 'ffdbb4' :
                        resortSettings.avatarSkinTone === 'Medium' ? 'edb98a' :
                        resortSettings.avatarSkinTone === 'Dark' ? '614335' : 'd08b5b';
        const color = resortSettings.avatarColor.replace('#', '');
        
        const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=Zuri&clothing=${clothing}&skinColor=${skinHex}&clothesColor=${color}&mouth=smile&eyes=happy&eyebrows=defaultNatural&top=shortCurly&facialHairProbability=0&accessoriesProbability=0&style=circle&backgroundColor=transparent`;
        
        avatarEl.innerHTML = `
            <img 
                src="${avatarUrl}" 
                style="width:100%;height:100%;object-fit:cover;border-radius:50%" 
                onerror="this.src='https://api.dicebear.com/9.x/initials/svg?seed=Zuri&backgroundColor=${color}'"
            />`;


        // Apply visual aura
        const orb = document.querySelector('.zuri-orb');
        if (orb) {
            orb.style.background = `radial-gradient(circle at 35% 35%, ${resortSettings.avatarColor}99, ${resortSettings.avatarColor}44, transparent 70%)`;
            orb.style.borderColor = `${resortSettings.avatarColor}66`;
        }
    }

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

            <!-- Voice Overlay (Premium Avatar Style) -->
            <div id="zuri-voice-overlay">
                <button class="zuri-voice-close" id="zuri-voice-close">&times;</button>
                <div class="zuri-voice-lang" id="zuri-voice-lang-label">English</div>
                
                <div class="zuri-avatar-wrap" id="zuri-avatar-wrap">
                    <div class="zuri-avatar-glow"></div>
                    <div class="zuri-avatar-ring"></div>
                    <div class="zuri-orb">
                        <div id="zuri-avatar-body" style="width:100px;height:100px;display:flex;align-items:center;justify-content:center;"></div>
                    </div>
                </div>

                <div class="zuri-live-caption" id="zuri-live-caption">Tap the avatar and start speaking...</div>
                <div class="zuri-voice-status" id="zuri-voice-status">Listening</div>
                <button class="zuri-stop-btn" id="zuri-stop-voice"><div class="stop-square"></div></button>
            </div>
        </div>
        <div id="zuri-bubble">
            <svg viewBox="0 0 24 24"><path d="M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z"/></svg>
        </div>
    `;
    document.body.appendChild(container);
    fetchResortSettings();

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
    const avatarWrap  = document.getElementById('zuri-avatar-wrap');
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
            avatarWrap.className = 'zuri-avatar-wrap processing';
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
                        avatarWrap.className = 'zuri-avatar-wrap';
                        voiceStatus.textContent = 'Idle';
                        liveCaption.textContent = 'Tap the avatar to speak again';
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
                liveCaption.textContent = 'Tap the avatar to try again';
            }
        }
    }

    sendBtn.onclick = () => sendMessage();
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

    // == TTS =====================================================
    function speak(text, onEnd) {
        if (!window.speechSynthesis) { if (onEnd) onEnd(); return; }
        window.speechSynthesis.cancel();
        
        if (voiceOverlay.classList.contains('active')) {
            avatarWrap.classList.add('talking');
        }

        const clean = text.replace(/[*_`#\[\]()>~]/g, '').replace(/<[^>]+>/g, '');
        const utter = new SpeechSynthesisUtterance(clean);
        utter.lang = langSel.value;
        utter.rate = 0.95;
        utter.onend = () => { 
            avatarWrap.classList.remove('talking');
            if (onEnd) onEnd(); 
        };
        utter.onerror = () => { 
            avatarWrap.classList.remove('talking');
            if (onEnd) onEnd(); 
        };
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
        avatarWrap.className = 'zuri-avatar-wrap listening';
        voiceStatus.textContent = 'Listening (Tap avatar to send)';
        liveCaption.textContent = 'Speak now...';
        liveCaption.className = 'zuri-live-caption interim';
        try { recognition.start(); } catch(e) {}
    }

    function stopListening() {
        isListening = false;
        avatarWrap.className = 'zuri-avatar-wrap';
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
        avatarWrap.className = 'zuri-avatar-wrap';
        voiceStatus.textContent = 'Ready';
        liveCaption.textContent = 'Tap the avatar to start speaking...';
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

    // Push-to-talk mechanic on the avatar
    avatarWrap.style.cursor = 'pointer';
    avatarWrap.onclick = () => {
        if (avatarWrap.classList.contains('processing')) return; // Ignore while processing backend
        
        if (isListening) {
            // Stop & Send
            stopListening();
            if (accumulatedTranscript.trim()) {
                const msg = accumulatedTranscript.trim();
                accumulatedTranscript = '';
                sendMessage(msg, { fromVoice: true });
            } else {
                voiceStatus.textContent = 'Idle';
                liveCaption.textContent = 'Tap the avatar to start speaking...';
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
