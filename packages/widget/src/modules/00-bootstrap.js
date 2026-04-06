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
    .zuri-live-caption strong{font-weight:700}
    .zuri-live-caption em{font-style:italic}
    .zuri-live-caption code{font-family:monospace;background:rgba(255,255,255,.12);padding:1px 4px;border-radius:4px}
    .zuri-live-caption ul,.zuri-live-caption ol{margin:4px 0;padding-left:18px;text-align:left}
    .zuri-live-caption li{margin:2px 0}

    .zuri-voice-status{color:rgba(255,255,255,.35);font-size:11px;margin-top:16px;letter-spacing:.5px;text-transform:uppercase}

    /* Stop button */
    .zuri-stop-btn{margin-top:28px;width:48px;height:48px;border-radius:50%;background:rgba(239,68,68,.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;box-shadow:0 4px 15px rgba(239,68,68,.3)}
    .zuri-stop-btn:hover{transform:scale(1.1);box-shadow:0 4px 20px rgba(239,68,68,.5)}
    .zuri-stop-btn .stop-square{width:16px;height:16px;background:#fff;border-radius:3px}

    /* == Auto Booking Sync Panel ================================ */
    #zuri-booking-sync{position:fixed;left:20px;bottom:20px;width:320px;max-width:calc(100vw - 40px);max-height:40vh;display:none;flex-direction:column;background:#fff;border:1px solid #e5e5e5;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.16);overflow:hidden;z-index:999998}
    #zuri-booking-sync.show{display:flex}
    #zuri-booking-sync-header{padding:10px 12px;background:#1a1a1a;color:#fff;font-size:12px;letter-spacing:.2px;font-weight:600}
    #zuri-booking-sync-list{overflow:auto;padding:8px;display:flex;flex-direction:column;gap:8px;background:#fafafa}
    .zuri-booking-sync-item{background:#fff;border:1px solid #ededed;border-radius:10px;padding:8px 10px}
    .zuri-booking-sync-code{font-size:12px;font-weight:700;color:#1a1a1a}
    .zuri-booking-sync-meta{font-size:12px;color:#555;margin-top:2px}
    .zuri-booking-sync-time{font-size:11px;color:#777;margin-top:4px}
    .zuri-booking-sync-footer{margin-top:6px;display:flex;align-items:center;justify-content:space-between;gap:8px}
    .zuri-booking-sync-status{font-size:10px;font-weight:700;letter-spacing:.3px;text-transform:uppercase;color:#2f6b2f}
    .zuri-booking-sync-status.cancelled{color:#8b1d1d}
    .zuri-booking-sync-cancel{border:1px solid #e7c5c5;background:#fff7f7;color:#8b1d1d;border-radius:7px;padding:4px 8px;font-size:11px;font-weight:600;cursor:pointer}
    .zuri-booking-sync-cancel:hover{background:#ffecec}
    .zuri-booking-sync-cancel:disabled{opacity:.55;cursor:not-allowed}
    .zuri-booking-card{margin-top:8px;border:1px solid #d9e9d7;background:linear-gradient(135deg,#f6fbf5 0%,#eef7ec 100%);border-radius:12px;padding:12px 14px;position:relative}
    .zuri-booking-card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
    .zuri-booking-card-title{font-size:11px;font-weight:700;letter-spacing:.4px;color:#2f6b2f;text-transform:uppercase}
    .zuri-booking-card-dismiss{background:none;border:none;cursor:pointer;font-size:14px;color:#999;padding:0 2px;line-height:1;transition:color .2s}
    .zuri-booking-card-dismiss:hover{color:#333}
    .zuri-booking-card-code-row{display:flex;align-items:center;gap:8px;margin:6px 0 8px;background:#fff;border:1px solid #e0e8de;border-radius:8px;padding:8px 10px}
    .zuri-booking-card-code{font-size:15px;font-weight:800;color:#1a1a1a;letter-spacing:.8px;font-family:'Courier New',Courier,monospace;user-select:all;flex:1}
    .zuri-booking-card-copy{display:inline-flex;align-items:center;gap:4px;background:#f0f7ee;border:1px solid #c8dcc5;color:#2f6b2f;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0}
    .zuri-booking-card-copy:hover{background:#e0f0dc;border-color:#a8c8a4}
    .zuri-booking-card-copy:active{transform:scale(.96)}
    .zuri-booking-card-meta{font-size:12px;color:#4a4a4a}
    #zuri-cancel-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(15,23,42,.56);backdrop-filter:blur(4px);z-index:1000000}
    #zuri-cancel-modal.show{display:flex}
    .zuri-cancel-modal-card{width:min(420px,100%);background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.24);padding:18px}
    .zuri-cancel-modal-title{margin:0;font-size:18px;font-weight:700;color:#111827}
    .zuri-cancel-modal-text{margin:10px 0 0;font-size:13px;line-height:1.6;color:#4b5563}
    .zuri-cancel-modal-code{margin-top:10px;font-size:12px;font-weight:700;color:#111827;letter-spacing:.3px}
    .zuri-cancel-modal-field{margin-top:14px}
    .zuri-cancel-modal-label{display:block;margin-bottom:6px;font-size:12px;font-weight:600;color:#374151}
    .zuri-cancel-modal-input{width:100%;border:1px solid #d1d5db;border-radius:10px;padding:10px 12px;font-size:13px;outline:none}
    .zuri-cancel-modal-input:focus{border-color:#111827}
    .zuri-cancel-modal-error{min-height:18px;margin-top:6px;font-size:11px;color:#b91c1c}
    .zuri-cancel-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
    .zuri-cancel-modal-secondary{border:1px solid #d1d5db;background:#fff;color:#374151;border-radius:10px;padding:9px 12px;font-size:12px;font-weight:700;cursor:pointer}
    .zuri-cancel-modal-primary{border:1px solid #dc2626;background:#dc2626;color:#fff;border-radius:10px;padding:9px 12px;font-size:12px;font-weight:700;cursor:pointer}
    .zuri-cancel-modal-primary:disabled{opacity:.55;cursor:not-allowed}
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
            <div id="zuri-messages"></div>
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
        <div id="zuri-booking-sync" aria-live="polite">
            <div id="zuri-booking-sync-header">Recent Concierge Bookings</div>
            <div id="zuri-booking-sync-list"></div>
        </div>
        <div id="zuri-cancel-modal" role="alertdialog" aria-modal="true" aria-labelledby="zuri-cancel-modal-title" aria-describedby="zuri-cancel-modal-text">
            <div class="zuri-cancel-modal-card">
                <h4 class="zuri-cancel-modal-title" id="zuri-cancel-modal-title">Cancel booking?</h4>
                <p class="zuri-cancel-modal-text" id="zuri-cancel-modal-text">Enter the guest full name exactly as booked to cancel this reservation.</p>
                <div class="zuri-cancel-modal-code" id="zuri-cancel-modal-code"></div>
                <div class="zuri-cancel-modal-field">
                    <label class="zuri-cancel-modal-label" for="zuri-cancel-guest-name">Guest full name</label>
                    <input id="zuri-cancel-guest-name" class="zuri-cancel-modal-input" type="text" autocomplete="name" />
                    <div class="zuri-cancel-modal-error" id="zuri-cancel-modal-error"></div>
                </div>
                <div class="zuri-cancel-modal-actions">
                    <button type="button" class="zuri-cancel-modal-secondary" id="zuri-cancel-modal-close">Keep Booking</button>
                    <button type="button" class="zuri-cancel-modal-primary" id="zuri-cancel-modal-confirm" disabled>Cancel Booking</button>
                </div>
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
    const bookingSyncPanel = document.getElementById('zuri-booking-sync');
    const bookingSyncList = document.getElementById('zuri-booking-sync-list');
    const cancelModal = document.getElementById('zuri-cancel-modal');
    const cancelModalCode = document.getElementById('zuri-cancel-modal-code');
    const cancelModalInput = document.getElementById('zuri-cancel-guest-name');
    const cancelModalError = document.getElementById('zuri-cancel-modal-error');
    const cancelModalClose = document.getElementById('zuri-cancel-modal-close');
    const cancelModalConfirm = document.getElementById('zuri-cancel-modal-confirm');

    const BOOKING_STORE_KEY = `zuri:bookings:${hotelId}`;
    const BOOKING_STORE_MAX = 20;
    const BOOKING_SYNC_AUTO_HIDE_MS = 12000;
    const CANCELLED_BOOKING_HIDE_DELAY_MS = 6000;
    const CHAT_HISTORY_MAX = 20;
    const BOOKING_SYNC_POLL_MS = 15000;
    let bookingSyncTimer = null;
    let bookingSyncHideTimer = null;
    let bookingSyncVisible = false;
    let voiceCaptionTimer = null;
    const bookingsByCode = new Map();
    const cancelledBookingTimers = new Map();
    let chatHistory = [];
    let pendingCancellationCode = null;
    let lastCancelTrigger = null;

