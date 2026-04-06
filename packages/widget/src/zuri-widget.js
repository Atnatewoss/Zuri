(function () {
    // == Config ==================================================
    const scriptTag = document.currentScript;
    const hotelId = scriptTag.getAttribute('data-hotel-id');
    const apiUrl = scriptTag.getAttribute('data-api-url') || 'http://localhost:8000';
    if (!hotelId) { console.error('Zuri widget: missing data-hotel-id'); return; }

    const LIVE_VOICE_DEBUG = true;
    const LANGS = [
        { code: 'en-US', label: 'EN', flag: '🇬🇧', name: 'English' },
        { code: 'am-ET', label: 'አማ', flag: '🇪🇹', name: 'Amharic' },
        { code: 'ti-ET', label: 'ትግ', flag: '🇪🇷', name: 'Tigrinya' },
        { code: 'om-ET', label: 'ኦሮ', flag: '🇪🇹', name: 'Oromifa' },
        { code: 'so-SO', label: 'So', flag: '🇸🇴', name: 'Somali' },
        { code: 'ar-SA', label: 'عر', flag: '🇸🇦', name: 'Arabic' },
        { code: 'fr-FR', label: 'FR', flag: '🇫🇷', name: 'French' },
        { code: 'it-IT', label: 'IT', flag: '🇮🇹', name: 'Italian' },
    ];

    // == Lightweight Markdown ====================================
    function md(t) {
        if (!t) return '';
        return t
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
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
    :root {
        --zuri-primary: #007AFF; 
        --zuri-glass-bg: rgba(22, 22, 28, 0.72);
        --zuri-glass-material: rgba(22, 22, 28, 0.75);
        --zuri-glass-border-light: rgba(255, 255, 255, 0.18);
        --zuri-blur: 40px;
        --zuri-vibrancy: saturate(180%) brightness(1.1);
        --zuri-radius-window: 36px;
        --zuri-shadow-heavy: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
        --zuri-glass-shadow-deep: 0 40px 80px rgba(0, 0, 0, 0.35);
        --zuri-text: #FFFFFF;
        --zuri-text-muted: rgba(255, 255, 255, 0.6);
        --zuri-ease: cubic-bezier(0.16, 1, 0.3, 1);
    }


    #zuri-widget-container {
        position: fixed;
        bottom: 32px;
        right: 32px;
        z-index: 999999;
        font-family: 'SF Pro Display', -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: var(--zuri-text);
        perspective: 2000px;
        user-select: none;
    }
    /* Fixed Spatial Hud (When active) */
    #zuri-widget-container.active {
        inset: 0;
        display: flex; align-items: center; justify-content: center;
        background: radial-gradient(circle at 50% 50%, rgba(0,0,0,0.1), rgba(0,0,0,0.5));
        pointer-events: none;
    }

    /* ✦ Premium Branded Launcher - Luxury Hospitality Design ✦ */
    .zuri-launcher {
        width: 56px; height: 56px;
        background: var(--zuri-glass-bg);
        backdrop-filter: blur(24px) saturate(180%);
        -webkit-backdrop-filter: blur(24px) saturate(180%);
        border-radius: 20px;
        box-shadow: 
            0 12px 40px rgba(0,0,0,0.5),
            var(--zuri-inner-glow),
            inset 0 1px 0 rgba(255,255,255,0.05);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid var(--zuri-glass-border);
        position: relative; overflow: hidden;
    }
    
    /* Hover State - Lift & Glow */
    .zuri-launcher:hover {
        transform: translateY(-8px) scale(1.1);
        border-color: rgba(0, 242, 255, 0.4);
        box-shadow: 
            0 24px 96px rgba(0, 242, 255, 0.2),
            var(--zuri-inner-glow),
            inset 0 1px 0 rgba(255,255,255,0.15);
    }
    
    /* Active/Pressed State */
    .zuri-launcher:active {
        transform: translateY(-4px) scale(1.05);
        box-shadow: 
            0 12px 40px rgba(0, 242, 255, 0.15),
            var(--zuri-inner-glow);
    }
    
    /* Hidden State */
    .zuri-launcher.hidden {
        opacity: 0;
        transform: scale(0.5);
        pointer-events: none;
        display: none;
    }
    
    /* Icon Styling - Solid & Sharp */
    .zuri-launcher svg {
        width: 26px; height: 26px;
        fill: #FFFFFF;
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .zuri-launcher:hover svg {
        transform: scale(1.15) rotate(5deg);
    }
    

    
    /* Notification Badge (Unread Messages) */
    .zuri-notification-badge {
        position: absolute;
        top: -4px; right: -4px;
        width: 20px; height: 20px;
        background: linear-gradient(135deg, #FF3B30, #FF9500);
        border-radius: 50%;
        border: 2px solid rgba(10, 10, 20, 0.9);
        display: none;
        align-items: center; justify-content: center;
        font-size: 10px; font-weight: 700;
        color: white;
        box-shadow: 0 4px 12px rgba(255, 59, 48, 0.4);
        animation: zuri-badge-pulse 2s ease-in-out infinite;
    }
    .zuri-notification-badge.visible { display: flex; }
    
    @keyframes zuri-badge-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.15); }
    }
    
    /* Ripple Effect on Click */
    .zuri-ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: zuri-ripple-effect 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes zuri-ripple-effect {
        to {
            transform: scale(2.5);
            opacity: 0;
        }
    }
    


    /* Cluely-Inspired Spatial HUD (Centered) */
    .zuri-chat-window {
        position: relative; 
        width: 560px; height: 480px;
        background: var(--zuri-glass-material);
        backdrop-filter: var(--zuri-blur) var(--zuri-vibrancy);
        -webkit-backdrop-filter: var(--zuri-blur) var(--zuri-vibrancy);
        border-radius: var(--zuri-radius-window);
        border: 1px solid var(--zuri-glass-border-light);
        box-shadow: var(--zuri-shadow-heavy);
        display: none; flex-direction: column; overflow: hidden;
        pointer-events: auto;
        transform: scale(0.9); opacity: 0;
        transition: all 0.6s var(--zuri-ease);
        animation: zuri-cluely-rise 0.6s var(--zuri-ease) forwards;
    }


    .zuri-chat-window.active { display: flex; }
    @keyframes zuri-cluely-rise {
        from { opacity: 0; transform: scale(0.8) translateY(40px); }
        to { opacity: 1; transform: scale(0.9) translateY(0); }
    }

    .zuri-msg-box {
        flex: 1; padding: 32px 24px; overflow-y: auto;
        display: flex; flex-direction: column; gap: 20px;
        scroll-behavior: smooth; scrollbar-width: none;
    }
    .zuri-msg-box::-webkit-scrollbar { display: none; }

    .zuri-msg {
        padding: 4px 6px; border-radius: 22px; max-width: 90%;
        font-size: 15px; line-height: 1.6; font-weight: 400;
        animation: zuri-msg-rise 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
    }
    @keyframes zuri-msg-rise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    
    .zuri-msg.user {
        background: linear-gradient(90deg, #007AFF, #00C2FF); 
        align-self: flex-end; padding: 10px 18px; border-radius: 20px;
        box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3); font-weight: 600;
        font-size: 13.5px; margin-bottom: 8px;
    }
    .zuri-msg.ai { 
        background: transparent; align-self: flex-start; border: none; box-shadow: none;
        padding-left: 0; padding-right: 20px; padding-bottom: 4px;
        color: #fff; text-shadow: 0 1px 12px rgba(0,0,0,0.4);
        display: flex; flex-direction: column; gap: 4px;
    }
    .zuri-tts-btn {
        width: 28px; height: 28px; border-radius: 50%;
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: 0.3s; opacity: 0; transform: scale(0.8);
        margin-top: 4px;
    }
    .zuri-msg.ai:hover .zuri-tts-btn { opacity: 0.6; transform: scale(1); }
    .zuri-tts-btn:hover { background: rgba(255,255,255,0.15); opacity: 1 !important; transform: scale(1.1); }
    .zuri-tts-btn svg { width: 14px; height: 14px; fill: #fff; }
    .zuri-msg-text { display: inline-block; width: 100%; white-space: pre-wrap; }
    .zuri-msg-text strong { font-weight: 700; color: #fff; }
    .zuri-msg-text em { font-style: italic; opacity: 0.9; }
    .zuri-msg-text ul { padding-left: 18px; margin: 8px 0; }
    .zuri-msg-text li { margin-bottom: 4px; }
    .zuri-msg-text code { background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 4px; font-family: monospace; }
    
    .zuri-copy-btn {
        position: absolute; left: 0; bottom: -28px; transform: scale(0.8);
        width: 24px; height: 24px; border-radius: 6px;
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: 0.3s; opacity: 0;
        margin-top: 8px; /* High-level spacing */
    }
    .zuri-msg.user .zuri-copy-btn { left: auto; right: 0; bottom: -28px; }
    .zuri-msg.ai .zuri-copy-btn { bottom: -28px; }


    .zuri-msg:hover .zuri-copy-btn { opacity: 0.6; transform: scale(1); }
    .zuri-copy-btn:hover { background: rgba(255,255,255,0.15); opacity: 1 !important; }
    .zuri-copy-btn svg { width: 12px; height: 12px; fill: #fff; }
    
    .zuri-copy-tooltip {
        position: absolute; left: 0; bottom: -24px; background: #00F2FF; color: #000;
        font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 800;
        opacity: 0; transition: 0.3s; pointer-events: none;
    }
    .zuri-msg.user .zuri-copy-tooltip { left: auto; right: 0; }
    .zuri-copy-btn.copied + .zuri-copy-tooltip { opacity: 1; transform: translateY(4px); }


    /* Cluely-Inspired Recessed Action Bar */
    .zuri-chat-input-area { padding: 24px 32px 32px 32px; background: transparent; border: none; }
    .zuri-action-row { display: flex; align-items: center; justify-content: center; gap: 14px; position: relative; }

    .zuri-input-pill-wrap {
        flex: 1; display: flex; align-items: center; gap: 12px;
        background: rgba(0, 0, 0, 0.3); border-radius: 14px;
        padding: 4px 8px;
        border: 1px solid rgba(255,255,255,0.06);
    }

    .zuri-chat-input {
        flex: 1; height: 44px; background: transparent; border: none;
        padding: 0 16px; color: #fff; font-size: 14px; outline: none;
    }
    .zuri-chat-input::placeholder { color: rgba(255,255,255,0.25); }

    .zuri-hang-btn {
        background: #FF3B30 !important; color: white !important;
        border-radius: 50% !important; width: 64px !important; height: 64px !important;
        box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3); transform: rotate(135deg);
        border: none !important; flex-shrink: 0;
    }
    .zuri-hang-btn:hover { background: #FF453A !important; transform: rotate(135deg) scale(1.1); }

    .zuri-chat-close {
        position: absolute; top: 24px; right: 24px;
        width: 32px; height: 32px; border-radius: 50%;
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: 0.3s; z-index: 10;
    }
    .zuri-chat-close:hover { background: rgba(255,255,255,0.15); transform: rotate(90deg); }
    .zuri-chat-close svg { opacity: 0.5; transition: 0.3s; }
    .zuri-chat-close:hover svg { opacity: 1; }
    
    .zuri-voice-action-pill { display: none; }

    .zuri-btn-glass {
        background: transparent; border: none;
        width: 40px; height: 40px; border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: 0.3s; color: rgba(255,255,255,0.4);
    }
    .zuri-btn-glass:hover { color: #fff; transform: scale(1.1); }
    .zuri-btn-glass svg { fill: currentColor; }

    /* ✦ Compact Language Dropdown - Unified Feel ✦ */
    .zuri-lang-menu {
        position: absolute; bottom: 64px; left: 0; 
        min-width: 140px; /* Smaller width */
        background: rgba(10, 10, 20, 0.98); backdrop-filter: blur(48px);
        -webkit-backdrop-filter: blur(48px);
        border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;
        box-shadow: 0 12px 32px rgba(0,0,0,0.5); 
        padding: 6px; /* Reduced padding */
        display: none; flex-direction: column; 
        gap: 2px; /* Minimal gap for unified feel */
        animation: zuri-menu-rise 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 1001;
    }
    .zuri-lang-menu.active { display: flex; }
    @keyframes zuri-menu-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .zuri-lang-item {
        padding: 8px 12px; /* Smaller padding */
        display: flex; align-items: center; gap: 8px; /* Reduced gap */
        color: #fff; font-size: 12px; /* Smaller font */
        font-weight: 600; /* Slightly lighter weight */
        cursor: pointer; /* Pointer cursor */
        border-radius: 10px; /* Smaller radius */
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); /* Smooth transition */
        border: 1px solid transparent;
    }
    .zuri-lang-item:hover { 
        background: rgba(255,255,255,0.08); /* Neutral hover */
        border-color: rgba(255,255,255,0.12); 
        transform: translateX(2px) scale(1.01); /* Subtle movement */
    }
    .zuri-lang-item.active { 
        background: rgba(255,255,255,0.12); /* Neutral active state - NO BLUE */
        color: #fff; /* Keep white text */
        border-color: rgba(255,255,255,0.2); 
    }
    .zuri-lang-item span { 
        font-size: 14px; /* Smaller flag size */
        min-width: 18px; 
    }

    /* Immersive Vision Pro HUD Overlay (Spatial Layering Fix) */
    .zuri-voice-overlay {
        position: absolute; inset: 0;
        z-index: 1000004; display: none; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.15); backdrop-filter: blur(8px);
        pointer-events: auto; /* Allow backdrop clicks if we want to bind them */
    }
    .zuri-voice-overlay.active { display: flex !important; }

    .zuri-voice-card {
        width: 560px; height: 480px;
        background: var(--zuri-glass-bg);
        backdrop-filter: blur(60px) saturate(210%);
        -webkit-backdrop-filter: blur(60px) saturate(210%);
        border-radius: 48px;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        border: 0.5px solid var(--zuri-glass-border);
        box-shadow: var(--zuri-glass-shadow-deep);
        transform: scale(0.9);
        pointer-events: auto;
        animation: zuri-shroud-blur 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes zuri-shroud-blur { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(0.9); } }



    .zuri-voice-status {
        font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 5px;
        background: linear-gradient(90deg, #00F2FF, #fff);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        margin-bottom: 40px; margin-top: 20px; opacity: 0.8;
    }

    .zuri-orb-wrap { width: 220px; height: 220px; position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .zuri-orb {
        width: 100px; height: 100px; background: radial-gradient(circle at 35% 35%, #00F2FF, transparent);
        border-radius: 50%;
        filter: blur(4px); box-shadow: 0 0 40px rgba(0, 242, 255, 0.3);
        transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        animation: zuri-orb-pulse 4s infinite ease-in-out;
    }
    .zuri-orb-wrap.listening .zuri-orb { transform: scale(1.2); filter: blur(8px); box-shadow: 0 0 60px rgba(0, 242, 255, 0.5); }
    .zuri-orb-wrap.processing .zuri-orb { background: #fff; box-shadow: 0 0 80px rgba(255, 255, 255, 0.4); animation: zuri-orb-pulse 1s infinite ease-in-out; }

    @keyframes zuri-orb-pulse {
        0%, 100% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.05); opacity: 1; }
    }

    .zuri-voice-caption {
        margin-top: 40px; font-size: 20px; font-weight: 300; text-align: center;
        max-width: 80%; color: #fff; line-height: 1.4; letter-spacing: -0.01em;
        text-shadow: 0 2px 20px rgba(0,0,0,0.5);
        max-height: 100px; overflow-y: auto; scrollbar-width: none;
        padding: 0 10px;
    }
    .zuri-voice-caption::-webkit-scrollbar { display: none; }

    /* Booking Sync & Modal Spatial Materials */
    .zuri-sync-panel {
        position: fixed; left: 32px; bottom: 32px; width: 340px;
        background: var(--zuri-glass-bg); backdrop-filter: blur(48px) saturate(210%);
        -webkit-backdrop-filter: blur(48px) saturate(210%);
        border: 0.5px solid var(--zuri-glass-border); border-radius: 28px;
        box-shadow: var(--zuri-glass-shadow-deep); padding: 24px;
        display: none; flex-direction: column; gap: 16px; z-index: 10000050;
        pointer-events: auto;

        transform: scale(0.8); opacity: 0; transform-origin: bottom left;
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .zuri-sync-panel.visible { display: flex; opacity: 1; transform: scale(0.9); }
    .zuri-sync-close {
        position: absolute; top: 16px; right: 16px;
        width: 32px; height: 32px; border-radius: 50%;
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: 0.3s; opacity: 0.6;
        z-index: 10;
    }
    .zuri-sync-close:hover { background: rgba(255,255,255,0.25); opacity: 1; transform: scale(1.1) rotate(90deg); }
    .zuri-sync-close svg { width: 14px; height: 14px; fill: #fff; }

    .zuri-sync-list { display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto; scrollbar-width: none; padding-bottom: 10px; }
    .zuri-sync-list::-webkit-scrollbar { display: none; }

    .zuri-booking-sync-item {
        background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px; padding: 18px; display: flex; flex-direction: column; gap: 6px;
        transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
    }
    .zuri-booking-sync-item:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.15); transform: translateY(-2px); }
    
    .zuri-booking-sync-code { font-size: 13px; font-weight: 800; color: #fff; letter-spacing: 0.5px; opacity: 0.9; user-select: text; }
    .zuri-booking-sync-meta { font-size: 11px; opacity: 0.5; color: #fff; margin-bottom: 2px; user-select: text; }
    
    .zuri-booking-sync-status { 
        position: absolute; top: 18px; right: 18px;
        font-size: 9px; font-weight: 900; text-transform: uppercase; padding: 4px 10px; 
        border-radius: 20px; background: rgba(48, 209, 88, 0.12); color: #30D158; 
        border: 1px solid rgba(48, 209, 88, 0.2);
    }
    .zuri-booking-sync-status.cancelled { background: rgba(255, 59, 48, 0.12); color: #FF3B30; border-color: rgba(255, 59, 48, 0.2); }
    
    .zuri-booking-sync-time { font-size: 10px; color: #fff; opacity: 0.4; font-weight: 600; margin-bottom: 4px; }
    
    .zuri-booking-sync-cancel {
        margin-top: 6px; background: rgba(255, 59, 48, 0.08); border: 1px solid rgba(255, 59, 48, 0.15);
        color: #FF3B30; font-size: 10px; font-weight: 800; padding: 10px; border-radius: 12px;
        cursor: pointer; transition: 0.25s; width: 100%; text-align: center;
        text-transform: uppercase; letter-spacing: 0.5px;
    }
    .zuri-booking-sync-cancel:hover { background: #FF3B30; color: #fff; transform: scale(1.01); box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3); }


    .zuri-modal-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.6);
        backdrop-filter: blur(12px); display: none; align-items: center; justify-content: center;
        z-index: 10000100; padding: 24px;
    }
    .zuri-modal-card {
        max-width: 300px; width: 100%; padding: 28px 24px;
        background: var(--zuri-glass-material); border-radius: 40px;
        backdrop-filter: var(--zuri-blur) var(--zuri-vibrancy);
        -webkit-backdrop-filter: var(--zuri-blur) var(--zuri-vibrancy);
        border: 0.5px solid var(--zuri-glass-border-light); 
        box-shadow: 0 40px 80px rgba(0, 0, 0, 0.35);
        transform: scale(0.92); transition: all 0.5s var(--zuri-ease);
        text-align: center;
        pointer-events: auto;
    }


    .zuri-modal-overlay.visible { opacity: 1; }
    .zuri-modal-overlay.visible .zuri-modal-card { transform: scale(1); }

    .zuri-conf-code-box {
        background: rgba(255,255,255,0.03); border-radius: 20px; padding: 20px;
        margin-bottom: 28px; border: 1px solid rgba(255,255,255,0.08);
        backdrop-filter: blur(10px); cursor: pointer; transition: 0.3s;
        position: relative; overflow: hidden;
    }
    .zuri-conf-code-box:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); transform: translateY(-2px); }
    .zuri-conf-code-box:active { transform: translateY(0) scale(0.98); }
    
    .zuri-copy-badge {
        position: absolute; top: 8px; right: 8px; font-size: 9px; font-weight: 800;
        color: var(--zuri-primary); text-transform: uppercase; letter-spacing: 1px;
        opacity: 0; transition: 0.3s; transform: translateY(5px);
    }
    .zuri-conf-code-box:hover .zuri-copy-badge { opacity: 0.6; transform: translateY(0); }
    .zuri-conf-code-box.copied .zuri-copy-badge { opacity: 1; color: #30D158; }

    .zuri-code-copy-mini {
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        border-radius: 6px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: 0.3s;
        opacity: 0; pointer-events: none; transform: translateX(5px);
    }
    /* .zuri-booking-sync-item:hover .zuri-code-copy-mini {
        opacity: 1 !important; pointer-events: auto !important; transform: translateX(0) !important;
    } */
    .zuri-code-copy-mini svg { pointer-events: none; }
    .zuri-code-copy-mini:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.2); transform: scale(1.05); }
    .zuri-code-copy-mini.copied { background: rgba(48, 209, 88, 0.2); border-color: #30D158; opacity: 1 !important; transform: translateX(0) scale(1) !important; }

    `;
    const sEl = document.createElement('style');
    sEl.textContent = css;
    document.head.appendChild(sEl);



    // == DOM ======================================================
    const container = document.createElement('div');
    container.id = 'zuri-widget-container';
    container.innerHTML = `
        <div id="zuri-bubble" class="zuri-launcher" role="button" tabindex="0" aria-label="Open Zuri AI Concierge">
            <svg viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5-1.338C8.47 21.513 10.179 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.477 0-2.866-.393-4.062-1.077l-2.617.7 0.7-2.617A7.954 7.954 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
            </svg>
            <!-- Notification Badge -->
            <div id="zuri-notification-badge" class="zuri-notification-badge" style="display: none;">!</div>
        </div>

        <div id="zuri-chat-window" class="zuri-chat-window">
            <button id="zuri-close-btn" class="zuri-chat-close" title="Close Chat">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
            <div id="zuri-messages" class="zuri-msg-box" style="padding-top:48px;"></div>

            <div id="zuri-input-area" class="zuri-chat-input-area">
                <div class="zuri-action-row">
                    <div class="zuri-input-pill-wrap">
                        <div id="zuri-lang-pill" class="zuri-lang-pill" title="Choose Language">${LANGS.find(l => l.code === 'en-US')?.flag || '🇬🇧'}</div>
                        <div id="zuri-lang-menu" class="zuri-lang-menu">
                            ${LANGS.map(l => `<div class="zuri-lang-item ${l.code === 'en-US' ? 'active' : ''}" data-code="${l.code}"><span>${l.flag}</span> ${l.name}</div>`).join('')}
                        </div>

                        <input type="text" id="zuri-input" class="zuri-chat-input" placeholder="Ask anything about Zuri..." autocomplete="off">
                        
                        <button id="zuri-mic-trigger" class="zuri-btn-glass" title="Voice Mode">
                            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                        </button>
                    </div>
                    
                    <button id="zuri-send-btn" class="zuri-btn-glass" title="Send Message" style="color:var(--zuri-primary);">
                        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    </button>
                </div>
            </div>

            </div>
        </div>

        <!-- Vision Pro HUD Overlay (Fixed Centering & Interactivity) -->
        <div id="zuri-voice-overlay" class="zuri-voice-overlay">
            <div class="zuri-voice-card">
                <div id="zuri-voice-status" class="zuri-voice-status">System Ready</div>
                
                <div id="zuri-orb-wrap" class="zuri-orb-wrap">
                    <div class="zuri-orb"></div>
                </div>

                <div id="zuri-voice-caption" class="zuri-voice-caption">Tap the orb to start speaking...</div>

                <button id="zuri-stop-voice" class="zuri-btn-glass zuri-hang-btn" title="End Session" style="margin-top:40px;">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                </button>
            </div>
        </div>

        <!-- Booking Sync Panel -->
        <div id="zuri-booking-sync" class="zuri-sync-panel">
            <button id="zuri-sync-close" class="zuri-sync-close" title="Dismiss">
                <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
            <div style="font-size:11px; font-weight:800; color:#fff; text-transform:uppercase; letter-spacing:1.5px; opacity:0.6;">Reservations</div>
            <div id="zuri-booking-sync-list" class="zuri-sync-list"></div>
        </div>

        <!-- Cancellation Modal -->
        <div id="zuri-cancel-modal" class="zuri-modal-overlay">
            <div class="zuri-modal-card">
                <h4 style="margin:0 0 12px 0; font-size:20px; font-weight:800; color:#fff;">Cancel Stay?</h4>
                <p style="margin:0; font-size:14px; line-height:1.6; color:var(--zuri-text-muted);">To cancel <span id="zuri-cancel-code" style="color:var(--zuri-primary); font-weight:700;"></span>, confirm your full guest name.</p>
                <input type="text" id="zuri-cancel-input" class="zuri-chat-input" placeholder="Full Guest Name" style="margin-top:20px; width:100%; height:48px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px;">
                <div id="zuri-cancel-error" style="color:#FF3B30; font-size:12px; margin-top:10px; min-height:1.2em;"></div>
                <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px;">
                    <button id="zuri-cancel-close" class="zuri-btn-glass" style="width:auto; padding:0 16px; border-radius:12px; color:#fff; font-weight:600;">Back</button>
                    <button id="zuri-cancel-confirm" class="zuri-btn-glass" style="background:#FF3B30; border-color:#FF3B30; color:#fff; width:auto; padding:0 18px; border-radius:12px;" disabled>Confirm</button>
                </div>
            </div>
        </div>

        <div id="zuri-conf-modal" class="zuri-modal-overlay">
            <div class="zuri-modal-card">
                <div style="width: 52px; height: 52px; background: rgba(48, 209, 88, 0.2); border: 1px solid rgba(48, 209, 88, 0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 8px 20px rgba(48, 209, 88, 0.3);">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="#30D158"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </div>
                <h4 style="margin: 0 0 4px 0; font-size: 18px; font-weight: 800; color: #fff;">Confirmed!</h4>
                <p style="margin: 0 0 16px 0; font-size: 12px; color: var(--zuri-text-muted);">Your reservation at Kuriftu is secured.</p>
                
                <div id="zuri-conf-code-tap" class="zuri-conf-code-box" style="padding: 16px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 10px; pointer-events: auto; z-index: 10;" title="Click to Copy">
                    <div id="zuri-conf-code-val" style="font-size: 22px; font-weight: 800; color: #fff; letter-spacing: 2px; user-select: text;">-------</div>
                    <button class="zuri-code-copy-mini" id="zuri-conf-copy-btn" style="pointer-events: none; opacity: 1 !important; transform: none !important;">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    </button>
                    <div class="zuri-copy-badge" id="zuri-conf-copy-text" style="top:4px; right:6px; pointer-events: none;">Click to Copy</div>
                </div>
                <div id="zuri-conf-details-val" style="font-size: 11px; color: #fff; opacity: 0.6; margin-top: -10px; margin-bottom: 20px; text-align: center;">Processing...</div>

                <button id="zuri-conf-done" class="zuri-btn-glass" style="width: 100%; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #007AFF, #00C2FF); color: #fff; font-size: 14px; font-weight: 700; border: none; box-shadow: 0 8px 20px rgba(0, 122, 255, 0.3); pointer-events: auto; cursor: pointer;">Great!</button>
            </div>
        </div>




    `;
    document.body.appendChild(container);

    // == Element Refs =============================================
    const bubble = container.querySelector('#zuri-bubble');
    const chatWin = container.querySelector('#zuri-chat-window');
    const closeBtn = container.querySelector('#zuri-close-btn');
    const msgBox = container.querySelector('#zuri-messages');
    const input = container.querySelector('#zuri-input');
    const sendBtn = container.querySelector('#zuri-send-btn');
    const micBtn = container.querySelector('#zuri-mic-trigger');
    const notificationBadge = container.querySelector('#zuri-notification-badge');

    // Custom Dropdown Refs
    const langPill = container.querySelector('#zuri-lang-pill');
    const langMenu = container.querySelector('#zuri-lang-menu');
    const langItems = container.querySelectorAll('.zuri-lang-item');

    // Voice Overlay Refs
    const voiceOverlay = container.querySelector('#zuri-voice-overlay');
    const voiceClose = container.querySelector('#zuri-voice-close');
    const voiceStatus = container.querySelector('#zuri-voice-status');
    const voiceCaption = container.querySelector('#zuri-voice-caption');
    const orbWrap = container.querySelector('#zuri-orb-wrap');
    const stopVoice = container.querySelector('#zuri-stop-voice');

    // Notification Badge State
    let hasUnreadMessages = false;

    // Booking & Cancellation Refs
    const bookingSyncPanel = container.querySelector('#zuri-booking-sync');
    const bookingSyncList = container.querySelector('#zuri-booking-sync-list');
    const cancelModal = container.querySelector('#zuri-cancel-modal');
    const cancelModalCode = container.querySelector('#zuri-cancel-code');
    const cancelModalInput = container.querySelector('#zuri-cancel-input');
    const cancelModalConfirm = container.querySelector('#zuri-cancel-confirm');
    const cancelModalClose = container.querySelector('#zuri-cancel-close');
    const cancelModalError = container.querySelector('#zuri-cancel-error');
    const syncCloseBtn = container.querySelector('#zuri-sync-close');

    // Conf Modal Refs
    const confModal = container.querySelector('#zuri-conf-modal');
    const confCodeVal = container.querySelector('#zuri-conf-code-val');
    const confDetailsVal = container.querySelector('#zuri-conf-details-val');
    const confDoneBtn = container.querySelector('#zuri-conf-done');
    const confCloseBtn = container.querySelector('#zuri-conf-close');
    const confCodeTap = container.querySelector('#zuri-conf-code-tap');
    const confCopyText = container.querySelector('#zuri-conf-copy-text');




    let selectedLang = 'en-US'; // Track manually for custom dropdown

    // Helper: Get Selected Language Name
    function getSelectedLanguageName() {
        return LANGS.find(l => l.code === selectedLang)?.name || 'English';
    }

    // == Custom Dropdown Logic ===================================
    langPill.onclick = (e) => {
        e.stopPropagation();
        langMenu.classList.toggle('active');
    };

    langItems.forEach(item => {
        item.onclick = () => {
            const code = item.dataset.code;
            const flag = item.querySelector('span').textContent;
            selectedLang = code;
            langPill.textContent = flag;

            langItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            langMenu.classList.remove('active');
        };
    });

    document.addEventListener('click', () => {
        langMenu.classList.remove('active');
    });

    const BOOKING_STORE_KEY = `zuri:bookings:${hotelId}`;
    const BOOKING_STORE_MAX = 20;
    const BOOKING_SYNC_AUTO_HIDE_MS = 12000;
    const CANCELLED_BOOKING_HIDE_DELAY_MS = 6000;
    const CHAT_HISTORY_MAX = 20;
    const BOOKING_SYNC_POLL_MS = 15000;

    let bookingSyncTimer = null;
    let bookingSyncHideTimer = null;
    let bookingSyncVisible = false;
    let bookingPanelReadyToShow = false;
    let voiceCaptionTimer = null;
    const bookingsByCode = new Map();
    const cancelledBookingTimers = new Map();
    const currentSessionBookings = new Set();
    let chatHistory = [];

    function pushChatHistory(role, text) {
        chatHistory.push({ role, text });
        if (chatHistory.length > CHAT_HISTORY_MAX) chatHistory.shift();
    }
    function getChatHistory() {
        return chatHistory;
    }

    // == Toggle Chat =============================================
    function renderChatGreeting() {
        msgBox.innerHTML = '';
        addMessageContent(addMessage("Hello! I'm Zuri, your AI concierge. How can I help you today?", 'ai'));
    }

    function resetChatSession() {
        chatHistory = [];
        input.value = '';
        renderChatGreeting();
    }

    function openChat() {
        container.classList.add('active');
        bubble.classList.add('hidden');
        chatWin.classList.add('active');

        chatWin.classList.add('active');


        if (!msgBox.children.length) renderChatGreeting();
        input.focus();
    }

    function closeChat() {
        container.classList.remove('active');
        chatWin.classList.remove('active');
        bubble.classList.remove('hidden');

        // Hide booking sync panel (left side modal)
        if (bookingSyncPanel) {
            bookingSyncPanel.classList.remove('visible');
            setTimeout(() => {
                if (!bookingSyncPanel.classList.contains('visible')) bookingSyncPanel.style.display = 'none';
            }, 500);
        }

        exitVoiceMode();
    }

    // ✦ Enhanced Bubble Interactions ============================

    // Ripple Effect on Click
    function createRipple(event) {
        const ripple = document.createElement('span');
        ripple.className = 'zuri-ripple';

        const rect = bubble.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';

        bubble.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    // Show Notification Badge
    function showNotificationBadge() {
        if (!hasUnreadMessages && notificationBadge) {
            hasUnreadMessages = true;
            notificationBadge.style.display = 'flex';
            notificationBadge.classList.add('visible');
        }
    }

    // Hide Notification Badge
    function hideNotificationBadge() {
        if (hasUnreadMessages && notificationBadge) {
            hasUnreadMessages = false;
            notificationBadge.style.display = 'none';
            notificationBadge.classList.remove('visible');
        }
    }

    bubble.onclick = (e) => {
        createRipple(e);
        if (chatWin.classList.contains('active')) {
            closeChat();
        } else {
            openChat();
            hideNotificationBadge(); // Clear badge when opening chat
        }
    };

    // Keyboard Accessibility - Enter/Space to open
    bubble.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            createRipple(e);
            if (chatWin.classList.contains('active')) {
                closeChat();
            } else {
                openChat();
                hideNotificationBadge();
            }
        }
    };

    closeBtn.onclick = (e) => {
        e.stopPropagation();
        closeChat();
    };

    micBtn.onclick = (e) => {
        e.stopPropagation();
        enterVoiceMode();
    };

    input.onkeydown = (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            sendMessage(input.value.trim());
            input.value = '';
        }
    };

    sendBtn.onclick = () => {
        if (input.value.trim()) {
            sendMessage(input.value.trim());
            input.value = '';
        }
    };

    // == Message Helpers =========================================
    function addMessage(text, type, opts = {}) {
        const div = document.createElement('div');
        div.className = `zuri-msg ${type}`;
        if (opts.ghost) div.classList.add('ghost');

        div.dataset.text = text;
        div.dataset.type = type;
        div.dataset.opts = JSON.stringify(opts);

        return div;
    }

    function addMessageContent(div) {
        const text = div.dataset.text;
        const type = div.dataset.type;
        const opts = JSON.parse(div.dataset.opts || '{}');

        if (opts.html) {
            div.innerHTML = opts.html;
        } else {
            const span = document.createElement('span');
            span.className = 'zuri-msg-text';
            span.innerHTML = md(text);
            div.appendChild(span);
        }

        // Add Copy Button
        const copyBtn = document.createElement('div');
        copyBtn.className = 'zuri-copy-btn';
        copyBtn.title = 'Copy to clipboard';
        copyBtn.innerHTML = `
            <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
        `;
        // const tooltip = document.createElement('div');
        // tooltip.className = 'zuri-copy-tooltip';
        // tooltip.textContent = 'Copied!';

        copyBtn.onclick = (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.classList.add('copied');
                copyBtn.innerHTML = `
                    <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                `;
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.innerHTML = `
                        <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    `;
                }, 2000);
            });
        };

        div.appendChild(copyBtn);
        // div.appendChild(tooltip);



        // Add TTS button for AI messages (Temporarily disabled per request)
        /*
        if (type === 'ai') {
            const ttsBtn = document.createElement('div');
            ttsBtn.className = 'zuri-tts-btn';
            ttsBtn.title = 'Listen to message';
            ttsBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
            ttsBtn.onclick = (e) => {
                e.stopPropagation();
                speakMessage(text);
            };
            div.appendChild(ttsBtn);
        }
        */

        msgBox.appendChild(div);
        msgBox.scrollTop = msgBox.scrollHeight;
        return div;
    }

    function speakMessage(text) {
        // Route through speak() which correctly dispatches:
        // - Browser-native TTS for EN/FR/IT
        // - Gemini TTS API for AR/AM/TI/OM/SO
        speak(toSpokenText(text));
    }

    function clearVoiceCaptionRotation() {
        if (!voiceCaptionTimer) return;
        clearInterval(voiceCaptionTimer);
        voiceCaptionTimer = null;
    }

    function toSpokenText(text) {
        const rendered = md(String(text || '')).replace(/<br\s*\/?>/gi, '\n');
        const probe = document.createElement('div');
        probe.innerHTML = rendered;
        return (probe.textContent || probe.innerText || '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function splitCaptionChunks(text, maxChars = 180) {
        const normalized = toSpokenText(text);
        if (!normalized) return [];

        const chunks = [];
        let position = 0;

        while (position < normalized.length) {
            let end = Math.min(position + maxChars, normalized.length);
            if (end < normalized.length) {
                const boundary = normalized.lastIndexOf(' ', end);
                if (boundary > position) {
                    end = boundary;
                }
            }
            if (end === position) {
                end = Math.min(position + maxChars, normalized.length);
            }

            const segment = normalized.slice(position, end).trim();
            if (segment) {
                chunks.push({
                    text: segment,
                    start: position,
                });
            }

            position = end;
            while (position < normalized.length && normalized[position] === ' ') {
                position += 1;
            }
        }

        return chunks;
    }

    function setVoiceCaption(text, opts = {}) {
        if (opts.markdown) {
            voiceCaption.innerHTML = md(text);
            return;
        }
        voiceCaption.textContent = text;
    }

    function getCaptionChunkForChar(chunks, charIndex) {
        if (!chunks.length) return '';
        for (let i = chunks.length - 1; i >= 0; i--) {
            if (charIndex >= chunks[i].start) return chunks[i].text;
        }
        return chunks[0].text;
    }

    function rotateVoiceCaption(text, durationMs) {
        clearVoiceCaptionRotation();
        const chunks = splitCaptionChunks(text);
        if (!chunks.length) {
            setVoiceCaption('');
            return;
        }

        let idx = 0;
        setVoiceCaption(chunks[idx].text);
        if (chunks.length === 1) return;

        const intervalMs = Math.max(2600, Math.min(5200, Math.round((durationMs || 0) / chunks.length) || 3200));
        voiceCaptionTimer = setInterval(() => {
            idx += 1;
            if (idx >= chunks.length) {
                clearVoiceCaptionRotation();
                return;
            }
            setVoiceCaption(chunks[idx].text);
        }, intervalMs);
    }

    function pushChatHistory(role, text) {
        const normalizedRole = role === 'model' ? 'model' : 'user';
        const normalizedText = String(text || '').trim();
        if (!normalizedText) return;
        chatHistory.push({ role: normalizedRole, text: normalizedText });
        if (chatHistory.length > CHAT_HISTORY_MAX) {
            chatHistory = chatHistory.slice(chatHistory.length - CHAT_HISTORY_MAX);
        }
    }

    function resolveGhost(el) {
        if (el) { el.classList.remove('ghost'); el.classList.add('resolved'); }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function loadBookings() {
        try {
            const raw = localStorage.getItem(BOOKING_STORE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
            return [];
        }
    }

    function saveBookings(bookings) {
        try {
            localStorage.setItem(BOOKING_STORE_KEY, JSON.stringify(bookings.slice(0, BOOKING_STORE_MAX)));
        } catch (_) { }
    }

    function formatDateDetailed(d) {
        if (!d || d === 'TBD') return d;
        try {
            const date = new Date(d.includes('-') ? d : d + 'T00:00:00');
            if (isNaN(date)) return d;
            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        } catch (_) { return d; }
    }

    function formatTimeAMPM(t) {
        if (!t || t === 'TBD') return t;
        if (t.includes('AM') || t.includes('PM')) return t;
        try {
            const [h, m] = t.split(':');
            const hour = parseInt(h);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const h12 = hour % 12 || 12;
            return `${h12}:${m || '00'} ${ampm}`;
        } catch (_) { return t; }
    }

    function normalizeBooking(raw) {

        if (!raw) return null;
        const code = (raw.confirmation_code || '').toUpperCase();
        if (!code) return null;
        return {
            confirmation_code: code,
            date: raw.date || 'TBD',
            time: raw.time || 'TBD',
            service: raw.service || 'Reservation',
            guest_name: raw.guest_name || 'Guest',
            status: raw.status || 'Confirmed',
            created_at: raw.created_at || new Date().toISOString(),
            message: raw.message || ''
        };
    }

    function parseBookingSignal(text) {
        if (!text) return null;
        const codeMatch = text.match(/\bZUR-[A-Z0-9]{4,}\b/i);
        if (!codeMatch) return null;

        const dateMatch = text.match(/\b20\d{2}-\d{2}-\d{2}\b/);
        const timeMatch = text.match(/\b([01]?\d|2[0-3]):[0-5]\d\b/);
        const serviceMatch = text.match(/(?:for|booked)\s+(.+?)(?:\s+on\s+\d{4}-\d{2}-\d{2}|\.|,|$)/i);

        return {
            confirmation_code: codeMatch[0].toUpperCase(),
            date: dateMatch ? dateMatch[0] : 'TBD',
            time: timeMatch ? timeMatch[0] : 'TBD',
            service: serviceMatch ? serviceMatch[1].trim() : 'Reservation',
            guest_name: 'Guest',
            status: 'Confirmed',
            created_at: new Date().toISOString(),
            message: text
        };
    }

    function addBookingConfirmationCard(booking) {
        if (!booking) return;
        const html = `
            <div class="zuri-booking-card">
                <div class="zuri-booking-card-title">Booking Confirmed</div>
                <div class="zuri-booking-card-code">${escapeHtml(booking.confirmation_code || 'ZUR-UNKNOWN')}</div>
                <div class="zuri-booking-card-meta">${escapeHtml(booking.service || 'Reservation')} on ${escapeHtml(booking.date || 'TBD')} at ${escapeHtml(booking.time || 'TBD')}</div>
            </div>
        `;
        addMessageContent(addMessage('', 'ai', { html }));
        showBookingConfirmationModal(booking);
    }

    function showBookingConfirmationModal(booking) {
        if (!booking || !confModal) return;
        confCodeVal.textContent = booking.confirmation_code || 'Confirmed';
        confDetailsVal.textContent = `${booking.service || 'Reservation'} on ${formatDateDetailed(booking.date)} @ ${formatTimeAMPM(booking.time)}`;

        
        // Handlers are managed via delegated listeners on the container
        confModal.style.display = 'flex';
        setTimeout(() => confModal.classList.add('visible'), 10);
    }

    function closeConfirmationModal() {
        if (!confModal) return;
        confModal.classList.remove('visible');
        setTimeout(() => {
            if (!confModal.classList.contains('visible')) confModal.style.display = 'none';
        }, 500);
    }

    function copyToClipboard(text, el, badgeEl) {
        text = String(text || '').trim();
        if (!text || text === '-------') {
            // console.warn('Zuri: No valid text to copy');
            return;
        }

        // console.log('Zuri: Attempting to copy:', text);

        const performCopyAction = () => {
            // console.log('Zuri: Copy successful');
            if (el) {
                el.classList.add('copied');
            }
            if (badgeEl) {
                badgeEl.textContent = 'Copied!';
                badgeEl.style.color = '#30D158';
            }
            setTimeout(() => {
                if (el) {
                    el.classList.remove('copied');
                }
                if (badgeEl) {
                    badgeEl.textContent = 'Click to Copy';
                    badgeEl.style.color = 'var(--zuri-primary)';
                }
            }, 2000);
        };

        const fallback = () => {
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                textArea.style.top = '0';
                textArea.setAttribute('readonly', '');
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                textArea.setSelectionRange(0, 9999);
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) performCopyAction();
                else console.error('Zuri: execCommand(copy) failed');
            } catch (err) {
                console.error('Zuri: Fallback copy failed', err);
            }
        };

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text)
                .then(performCopyAction)
                .catch(err => {
                    console.warn('Zuri: navigator.clipboard failed, using fallback', err);
                    fallback();
                });
        } else {
            fallback();
        }
    }



    function publishBookingSync(booking) {
        if (!booking || !booking.confirmation_code) return;
        const normalized = normalizeBooking(booking);
        if (!normalized) return;

        const list = loadBookings();
        const existingIdx = list.findIndex(b => b.confirmation_code === normalized.confirmation_code);
        if (existingIdx !== -1) {
            list[existingIdx] = normalized;
        } else {
            list.unshift(normalized);
        }
        saveBookings(list);
        
        // Mark as current session booking
        currentSessionBookings.add(normalized.confirmation_code);
        
        renderBookingSyncPanel();
        showBookingSyncPanel();
    }


    function markBookingCancelledLocally(code) {
        const list = loadBookings();
        const b = list.find(x => x.confirmation_code === code);
        if (b) {
            b.status = 'Cancelled';
            saveBookings(list);
            renderBookingSyncPanel();

            const existingTimer = cancelledBookingTimers.get(code);
            if (existingTimer) clearTimeout(existingTimer);

            const timer = setTimeout(() => {
                const updated = loadBookings().filter(x => x.confirmation_code !== code);
                saveBookings(updated);
                renderBookingSyncPanel();
                cancelledBookingTimers.delete(code);
            }, CANCELLED_BOOKING_HIDE_DELAY_MS);
            cancelledBookingTimers.set(code, timer);
        }
    }

    /* 
    async function cancelBookingFromWidget(confirmationCode, guestName) {
        if (!cancelModalConfirm || !cancelModalError) return;

        try {
            const res = await fetch(`${apiUrl}/api/bookings/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Zuri-Hotel-Id': hotelId },
                body: JSON.stringify({ confirmation_code: confirmationCode, guest_name: guestName, hotel_id: hotelId }),
            });
            const data = await res.json();

            if (res.ok) {
                markBookingCancelledLocally(confirmationCode);
                addMessageContent(addMessage(data.message || `Booking ${confirmationCode} has been cancelled.`, 'ai'));
                closeCancelModal();
            } else {
                cancelModalError.textContent = data.detail || 'Could not verify name. Please check spelling.';
                cancelModalConfirm.disabled = false;
            }
        } catch (err) {
            cancelModalError.textContent = 'Network error. Please try again.';
            cancelModalConfirm.disabled = false;
        }
    }
    */

    function syncCancelModalState() {
        if (!cancelModalInput || !cancelModalConfirm) return;
        cancelModalConfirm.disabled = cancelModalInput.value.trim().length < 2;
    }

    function openCancelModal(code) {
        if (!cancelModal || !cancelModalCode || !cancelModalInput || !cancelModalError) return;
        pendingCancellationCode = code;
        cancelModalCode.textContent = code;
        cancelModalInput.value = '';
        cancelModalError.textContent = '';
        syncCancelModalState();
        cancelModal.style.display = 'flex';
        cancelModalInput.focus();
    }

    function closeCancelModal() {
        if (!cancelModal) return;
        cancelModal.style.display = 'none';
        pendingCancellationCode = null;
    }

    function renderBookingSyncPanel() {
        if (!bookingSyncList || !bookingSyncPanel) return;
        const allBookings = loadBookings();
        // ONLY show bookings from current session
        const list = allBookings.filter(b => currentSessionBookings.has(b.confirmation_code));
        
        if (list.length === 0) {
            bookingSyncPanel.classList.remove('visible');
            setTimeout(() => {
                if (!bookingSyncPanel.classList.contains('visible')) bookingSyncPanel.style.display = 'none';
            }, 500);
            return;
        }

        bookingSyncList.innerHTML = list.map(b => `
            <div class="zuri-booking-sync-item" id="zsync-${escapeHtml(b.confirmation_code)}">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div class="zuri-booking-sync-code">${escapeHtml(b.confirmation_code)}</div>
                    <button class="zuri-code-copy-mini" data-code="${escapeHtml(b.confirmation_code)}" title="Copy Code">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="white"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    </button>
                </div>
                <div class="zuri-booking-sync-status">${escapeHtml(b.status || 'Confirmed')}</div>
                <div class="zuri-booking-sync-meta">${escapeHtml(b.service)}</div>
                <div class="zuri-booking-sync-time">${formatDateDetailed(b.date)} at ${formatTimeAMPM(b.time)}</div>
            </div>
        `).join('');

        // Explicit direct event listeners to bypass strict browser event delegation bugs with SVGs
        bookingSyncList.querySelectorAll('.zuri-code-copy-mini').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const code = btn.getAttribute('data-code');
                // console.log('Zuri: Explicit copy trigger (Sync Panel)', code);
                copyToClipboard(code, btn, null);
            });
        });

        window._zuriOpenCancel = (code) => { /* Disabled */ };
    }

    function hideBookingSyncPanel() {
        if (!bookingSyncPanel) return;
        bookingSyncPanel.classList.remove('visible');
        setTimeout(() => {
            if (!bookingSyncPanel.classList.contains('visible')) bookingSyncPanel.style.display = 'none';
        }, 500);
    }

    function showBookingSyncPanel() {

        if (!bookingSyncPanel) return;


        bookingSyncPanel.style.display = 'flex';
        // Small timeout to allow display property to be registered for the transition
        setTimeout(() => bookingSyncPanel.classList.add('visible'), 20);

        if (bookingSyncHideTimer) {
            clearTimeout(bookingSyncHideTimer);
            bookingSyncHideTimer = null;
        }
    }

    if (syncCloseBtn) {
        syncCloseBtn.onclick = (e) => {
            if (e) e.stopPropagation();
            if (bookingSyncHideTimer) clearTimeout(bookingSyncHideTimer);
            bookingSyncPanel.classList.remove('visible');
            setTimeout(() => {
                if (!bookingSyncPanel.classList.contains('visible')) bookingSyncPanel.style.display = 'none';
            }, 500);
        };
    }

    async function syncBookingsFromServer() {
        try {
            const res = await fetch(`${apiUrl}/api/bookings/public?hotel_id=${encodeURIComponent(hotelId)}&limit=10`, {
                headers: { 'X-Zuri-Hotel-Id': hotelId }
            });
            if (!res.ok) return;
            const remote = await res.json();
            if (!Array.isArray(remote) || !remote.length) return;

            const local = loadBookings();
            const remoteNormalized = remote.map(normalizeBooking).filter(Boolean);
            
            // Robust deduplication
            const mergedMap = new Map();
            remoteNormalized.forEach(b => mergedMap.set(b.confirmation_code, b));
            local.forEach(b => {
                const code = b.confirmation_code;
                if (!code) return; // skip corrupt
                if (!mergedMap.has(code)) mergedMap.set(code, b);
            });

            saveBookings(Array.from(mergedMap.values()));
            renderBookingSyncPanel();
        } catch (_) { }
    }

    syncBookingsFromServer();
    bookingSyncTimer = setInterval(syncBookingsFromServer, BOOKING_SYNC_POLL_MS);

    async function sendMessage(text, opts = {}) {
        text = (text || input.value).trim();
        if (!text) return;

        // Ghost-write the user message (dim if from voice mode)
        const userBubble = addMessageContent(addMessage(text, 'user', { ghost: opts.fromVoice }));
        pushChatHistory('user', text);
        input.value = '';

        // Ghost-write a loader
        const loader = addMessageContent(addMessage('...', 'ai', { raw: true, ghost: opts.fromVoice }));

        // Update voice overlay if active
        if (opts.fromVoice && voiceOverlay.classList.contains('active')) {
            orbWrap.className = 'zuri-orb-wrap processing';
            voiceStatus.textContent = 'Thinking';
            clearVoiceCaptionRotation();
            setVoiceCaption('Thinking...');
        }


        try {
            const res = await fetch(`${apiUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Zuri-Hotel-Id': hotelId },
                body: JSON.stringify({
                    message: text,
                    hotel_id: hotelId,
                    language: selectedLang,
                    conversation_history: getChatHistory(),
                    session_id: 'widget-session'
                })
            });
            const data = await res.json();
            if (msgBox.contains(loader)) msgBox.removeChild(loader);
            resolveGhost(userBubble);

            const aiText = data.response || 'Sorry, something went wrong.';
            const bookingSignal = parseBookingSignal(aiText);
            if (bookingSignal) {
                publishBookingSync(bookingSignal);
                addBookingConfirmationCard(bookingSignal);
            }
            const aiBubble = addMessageContent(addMessage(aiText, 'ai', { ghost: opts.fromVoice }));
            pushChatHistory('model', aiText);

            // Show notification badge if chat is closed and new message arrives
            if (!chatWin.classList.contains('active')) {
                showNotificationBadge();
            }

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
                        voiceStatus.textContent = `${getSelectedLanguageName()} Ready`;
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
            if (msgBox.contains(loader)) msgBox.removeChild(loader);
            resolveGhost(userBubble);
            addMessageContent(addMessage("Sorry, I'm having trouble connecting right now.", 'ai'));
            if (opts.fromVoice && voiceOverlay.classList.contains('active')) {
                orbWrap.className = 'zuri-orb-wrap';
                voiceStatus.textContent = `${getSelectedLanguageName()} Ready`;
                clearVoiceCaptionRotation();
                setVoiceCaption('Tap the orb to try again');
            }
        }
    }

    async function sendVoiceInteract(blob) {
        const formData = new FormData();
        formData.append('audio', blob, `voice-input.${blob.type.includes('webm') ? 'webm' : 'wav'}`);
        formData.append('hotel_id', hotelId);
        formData.append('language', selectedLang);
        formData.append('conversation_history_json', JSON.stringify(getChatHistory()));

        const userBubble = addMessageContent(addMessage('...', 'user', { ghost: true }));
        const aiBubble = addMessageContent(addMessage('...', 'ai', { ghost: true }));

        try {
            const res = await fetch(`${apiUrl}/api/voice/interact`, {
                method: 'POST',
                headers: { 'X-Zuri-Hotel-Id': hotelId },
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.detail || 'Voice interaction failed.');

            const userTextSpan = userBubble.querySelector('.zuri-msg-text');
            if (userTextSpan) userTextSpan.textContent = data.user_text;
            resolveGhost(userBubble);
            pushChatHistory('user', data.user_text);

            const aiText = data.ai_text;
            const aiTextSpan = aiBubble.querySelector('.zuri-msg-text');
            if (aiTextSpan) aiTextSpan.textContent = aiText;
            pushChatHistory('model', aiText);

            const bookingSignal = parseBookingSignal(aiText);
            if (bookingSignal) {
                publishBookingSync(bookingSignal);
                addBookingConfirmationCard(bookingSignal);
            }

            voiceStatus.textContent = 'Speaking';
            const audioData = atob(data.audio_base64);
            const arrayBuffer = new ArrayBuffer(audioData.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < audioData.length; i++) view[i] = audioData.charCodeAt(i);
            const audioBlob = new Blob([arrayBuffer], { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            remoteAudio = audio;

            const spokenText = toSpokenText(aiText);
            const captionChunks = splitCaptionChunks(spokenText);
            if (captionChunks.length) setVoiceCaption(captionChunks[0].text);

            audio.onplay = () => {
                rotateVoiceCaption(spokenText, estimateSpeechDurationMs(spokenText, 1));
            };

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                if (remoteAudio === audio) remoteAudio = null;
                clearVoiceCaptionRotation();
                resolveGhost(aiBubble);
                if (voiceOverlay.classList.contains('active')) {
                    orbWrap.className = 'zuri-orb-wrap';
                    voiceStatus.textContent = 'Ready';
                    setVoiceCaption('Tap the orb to speak again');
                }
            };
            audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                if (remoteAudio === audio) remoteAudio = null;
                resolveGhost(aiBubble);
            };
            await audio.play();

        } catch (err) {
            console.error('Voice Interact Error:', err);
            userBubble.remove();
            aiBubble.remove();
            addMessageContent(addMessage("Sorry, I'm having trouble connecting right now.", 'ai'));
            orbWrap.className = 'zuri-orb-wrap';
            voiceStatus.textContent = 'Ready';
            setVoiceCaption('Tap the orb to try again');
        } finally {
            pendingVoiceTranscription = false;
        }
    }

    sendBtn.onclick = () => sendMessage();
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

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
        const lang = selectedLang;
        const nativeLangs = ['en-US', 'fr-FR', 'it-IT'];
        if (nativeLangs.includes(lang)) return false;
        return GEMINI_TTS_LANGS.has(lang);
    }

    function stopRemoteAudioPlayback() {
        if (!remoteAudio) return;
        remoteAudio.pause();
        remoteAudio.src = '';
        remoteAudio = null;
    }

    function shouldUseLiveVoice() {
        // Exclude languages that behave poorly with the Multimodal Live API
        const UNSUPPORTED_LIVE_LANGS = ['am-ET', 'om-ET', 'ti-ET', 'ar-SA', 'so-SO'];
        if (UNSUPPORTED_LIVE_LANGS.includes(selectedLang)) return false;
        return true;
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
        accumulatedTranscript = '';
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
        } catch (_) { }
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
        url.searchParams.set('language', LANGS.find((l) => l.code === selectedLang)?.name || 'English');
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

        voiceStatus.textContent = 'Connecting...';
        liveSocket = new WebSocket(buildLiveVoiceUrl());
        // Phantom STT for instant transcripts
        if (SpeechRecognition) {
            phantomRecognition = new SpeechRecognition();
            phantomRecognition.continuous = true;
            phantomRecognition.interimResults = true;
            phantomRecognition.lang = selectedLang;
            phantomRecognition.onresult = (e) => {
                let interim = '';
                for (let i = e.resultIndex; i < e.results.length; i++) {
                    const res = e.results[i];
                    if (res.isFinal) {
                        accumulatedTranscript += ' ' + res[0].transcript;
                    } else {
                        interim += res[0].transcript;
                    }
                }
                const fullText = (accumulatedTranscript + ' ' + interim).trim();
                if (fullText) {
                    setVoiceCaption(fullText, { interim: !!interim });
                    liveUserTranscript = fullText;
                }
            };
            try { phantomRecognition.start(); } catch (_) { }
        }

        liveSocket.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            if (LIVE_VOICE_DEBUG) {
                console.debug("Zuri live voice payload", payload);
            }
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
                voiceStatus.textContent = 'Thinking';
                if (liveAssistantTranscript) setVoiceCaption(liveAssistantTranscript, { interim: !payload.finished });
                if (payload.finished) {
                    voiceStatus.textContent = 'Speaking';
                    commitLiveAssistantTranscript();
                }
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
            if (phantomRecognition) { try { phantomRecognition.stop(); } catch (_) { } }
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
        utter.lang = selectedLang;
        utter.rate = 1.08;
        utter.pitch = 1.02;
        const preferredVoice = pickBestVoice(selectedLang);
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
    const GEMINI_TTS_LANGS = new Set(['am-ET', 'ti-ET', 'om-ET', 'ar-SA', 'so-SO']);
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
    let phantomRecognition = null;

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
                voiceStatus.textContent = `Listening (${getSelectedLanguageName()})`;
            }

            if (finalChunk) {
                accumulatedTranscript += ' ' + finalChunk;
                clearVoiceCaptionRotation();
                setVoiceCaption(accumulatedTranscript.trim());
                voiceStatus.textContent = `${getSelectedLanguageName()} Ready`;
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
                try { recognition.start(); } catch (e) { }
            }
        };
    }

    function shouldUseGeminiTranscription() {
        const lang = selectedLang;
        const nativeLangs = ['en-US', 'fr-FR', 'it-IT'];
        if (nativeLangs.includes(lang)) return false;
        return GEMINI_TRANSCRIBE_LANGS.has(lang) || !recognition;
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
            voiceStatus.textContent = 'Thinking';
            setVoiceCaption('Thinking...');

            const blob = new Blob(mediaRecorderChunks, { type: mediaRecorder.mimeType });
            mediaRecorderChunks = [];

            if (shouldUseLiveVoice()) {
                pendingVoiceTranscription = false;
                orbWrap.className = 'zuri-orb-wrap';
                voiceStatus.textContent = 'Ready';
                return;
            }

            const lang = selectedLang;
            const nativeLangs = ['en-US', 'fr-FR', 'it-IT'];
            if (!nativeLangs.includes(lang)) {
                await sendVoiceInteract(blob);
                return;
            }

            try {
                const transcript = await transcribeCapturedAudio(blob);
                if (!transcript) {
                    voiceStatus.textContent = 'Ready';
                    setVoiceCaption('No speech detected. Tap the orb to try again.');
                    pendingVoiceTranscription = false;
                    orbWrap.className = 'zuri-orb-wrap';
                    return;
                }
                setVoiceCaption(transcript);
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
        recognition.lang = selectedLang;
        orbWrap.className = 'zuri-orb-wrap listening';
        voiceStatus.textContent = 'Listening (Tap orb to send)';
        clearVoiceCaptionRotation();
        setVoiceCaption('Speak now...', { interim: true });
        try { recognition.start(); } catch (e) { }
    }

    function stopListening() {
        if (shouldUseLiveVoice()) {
            isListening = false;
            cleanupLiveInputStream();
            orbWrap.className = 'zuri-orb-wrap processing';
            voiceStatus.textContent = 'Thinking';
            
            const transcript = liveUserTranscript.trim();
            setVoiceCaption(transcript || 'Thinking...');

            // FAIL-SAFE: If socket is NOT open or was never established, fall back to Standard REST immediately
            if (!liveSocket || liveSocket.readyState !== WebSocket.OPEN) {
                console.warn('Zuri: Live WebSocket not ready, falling back to REST.');
                if (transcript) {
                    sendMessage(transcript, { fromVoice: true });
                } else {
                    // Reset if nothing to send
                    voiceStatus.textContent = 'Ready';
                    orbWrap.className = 'zuri-orb-wrap';
                }
                if (phantomRecognition) { try { phantomRecognition.stop(); } catch (_) { } }
                return;
            }

            // Standard Live submission
            liveSocket.send(JSON.stringify({ type: 'end' }));
            if (phantomRecognition) { try { phantomRecognition.stop(); } catch (_) { } }
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
        try { recognition.stop(); } catch (e) { }
    }

    // == Voice Mode (Overlay) ====================================
    function enterVoiceMode() {
        if (!shouldUseLiveVoice() && !SpeechRecognition && (!navigator.mediaDevices || !window.MediaRecorder)) {
            alert('Voice input is not supported in this browser. Please use Google Chrome.');
            return;
        }

        // Show Selected Language instead of "System Ready"
        const selectedLanguageName = LANGS.find(l => l.code === selectedLang)?.name || 'English';
        voiceStatus.textContent = `${getSelectedLanguageName()} Active`;
        setVoiceCaption('Initializing...');

        voiceModeActive = true;
        voiceOverlay.classList.add('active');

        // Start Listening Immediately
        accumulatedTranscript = '';
        startListening();
    }

    function exitVoiceMode() {
        try {
            voiceModeActive = false;
            stopListening();
            cleanupLiveInputStream();

            if (typeof liveSocket !== 'undefined' && liveSocket && typeof liveSocket.close === 'function') {
                try { liveSocket.close(); } catch (e) { }
                liveSocket = null;
            }

            livePlaybackTime = 0;
            stopRemoteAudioPlayback();
            window.speechSynthesis && window.speechSynthesis.cancel();
            clearVoiceCaptionRotation();
        } catch (error) {
            console.error('Zuri: Error during voice exit:', error);
        } finally {
            voiceOverlay.classList.remove('active');
            // All ghost messages become solid when exiting voice
            try {
                msgBox.querySelectorAll('.ghost').forEach(el => resolveGhost(el));
            } catch (e) { }
        }
    }

    micBtn.onclick = (e) => {
        e.stopPropagation();
        enterVoiceMode();
    };
    if (voiceClose) voiceClose.onclick = (e) => { e.stopPropagation(); exitVoiceMode(); };
    if (stopVoice) stopVoice.onclick = (e) => { e.stopPropagation(); exitVoiceMode(); };

    // Push-to-talk mechanic on the orb
    orbWrap.style.cursor = 'pointer';
    orbWrap.onclick = () => {
        // Prevent click if currently speaking/remote audio is playing
        if (remoteAudio && !remoteAudio.paused) {
            stopRemoteAudioPlayback();
            clearVoiceCaptionRotation();
            orbWrap.className = 'zuri-orb-wrap';
            voiceStatus.textContent = `${getSelectedLanguageName()} Ready`;
            setVoiceCaption('Tap the orb to start speaking...');
            return;
        }

        if (orbWrap.classList.contains('processing') || pendingVoiceTranscription) return;

        // Check if actively listening
        const isActivelyListening = isListening;

        if (isActivelyListening) {
            // Stop & Send
            stopListening();
            if (!shouldUseGeminiTranscription() && accumulatedTranscript.trim()) {
                const msg = accumulatedTranscript.trim();
                accumulatedTranscript = '';
                sendMessage(msg, { fromVoice: true });
            } else if (!shouldUseGeminiTranscription()) {
                voiceStatus.textContent = `${getSelectedLanguageName()} Ready`;
                setVoiceCaption('Tap the orb to start speaking...');
            }
        } else {
            // Start
            startListening();
        }
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

    if (confDoneBtn) {
        confDoneBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeConfirmationModal();
        });
    }
    if (confModal) {
        confModal.addEventListener('click', (e) => {
            if (e.target === confModal) closeConfirmationModal();
        });
    }

    // == DELEGATED CLICK LISTENERS (Robust) ==
    container.addEventListener('click', (e) => {
        // 1. Modal Confirmation Code Tap
        const tap = e.target.closest('#zuri-conf-code-tap');
        if (tap) {
            e.preventDefault();
            e.stopPropagation();
            const code = (confCodeVal.textContent || '').trim();
            // console.log('Zuri: Delegated copy trigger (Modal)', code);
            copyToClipboard(code, tap, confCopyText);
            
            const btn = tap.querySelector('.zuri-code-copy-mini');
            if (btn) {
                btn.classList.add('copied');
                setTimeout(() => btn.classList.remove('copied'), 2000);
            }
            return;
        }

        // 2. Sync Panel Mini Copy Buttons
        const miniBtn = e.target.closest('.zuri-code-copy-mini');
        if (miniBtn) {
            const code = miniBtn.getAttribute('data-code');
            // console.log('Zuri: Delegated copy trigger (Sync Panel)', code);
            copyToClipboard(code, miniBtn, null);
            return;
        }
        
        // 3. Central Modal Done Button
        if (e.target.closest('#zuri-conf-done')) {
            e.stopPropagation();
            closeConfirmationModal();
            return;
        }

        // 5. Sync Panel Close Button (Top Right X)
        if (e.target.closest('#zuri-sync-close')) {
            e.stopPropagation();
            hideBookingSyncPanel();
            return;
        }
    });

    // Re-bind explicit listener for the sync panel close button just in case delegation missed the SVG click area
    if (syncCloseBtn) {
        syncCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            hideBookingSyncPanel();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cancelModal && cancelModal.classList.contains('show')) {
            closeCancelModal();
        }
    });

})();
