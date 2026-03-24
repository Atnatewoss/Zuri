(function() {
    // 1. Configuration
    const scriptTag = document.currentScript;
    const hotelId = scriptTag.getAttribute('data-hotel-id');
    const apiUrl = scriptTag.getAttribute('data-api-url') || 'http://localhost:8000';
    if (!hotelId) {
        console.error('Zuri widget is missing required data-hotel-id attribute.');
        return;
    }

    // 2. Inject Styles
    const styles = `
        #zuri-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        #zuri-bubble {
            width: 60px;
            height: 60px;
            background: #1a1a1a;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        }
        #zuri-bubble:hover { transform: scale(1.1); }
        #zuri-bubble svg { width: 30px; height: 30px; fill: white; }

        #zuri-chat-window {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            display: none;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid #eee;
        }
        #zuri-chat-header {
            background: #1a1a1a;
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        #zuri-chat-header h3 { margin: 0; font-size: 16px; }
        #zuri-close-btn { cursor: pointer; font-size: 20px; }

        #zuri-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #f9f9f9;
        }
        .zuri-msg {
            margin-bottom: 12px;
            padding: 10px 14px;
            border-radius: 12px;
            max-width: 80%;
            font-size: 14px;
            line-height: 1.4;
        }
        .zuri-msg.user {
            background: #1a1a1a;
            color: white;
            align-self: flex-end;
            margin-left: auto;
        }
        .zuri-msg.ai {
            background: white;
            color: #333;
            border: 1px solid #eee;
        }

        #zuri-input-area {
            padding: 15px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
        }
        #zuri-input {
            flex: 1;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 8px 12px;
            outline: none;
        }
        #zuri-send-btn {
            background: #1a1a1a;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 8px 15px;
            cursor: pointer;
        }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // 3. Create Elements
    const container = document.createElement('div');
    container.id = 'zuri-widget-container';
    container.innerHTML = `
        <div id="zuri-chat-window">
            <div id="zuri-chat-header">
                <h3>Zuri AI Concierge</h3>
                <span id="zuri-close-btn">&times;</span>
            </div>
            <div id="zuri-messages">
                <div class="zuri-msg ai">Hello! I'm Zuri, your AI concierge. How can I help you today?</div>
            </div>
            <div id="zuri-input-area">
                <input type="text" id="zuri-input" placeholder="Type a message...">
                <button id="zuri-send-btn">Send</button>
            </div>
        </div>
        <div id="zuri-bubble">
            <svg viewBox="0 0 24 24"><path d="M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z"/></svg>
        </div>
    `;
    document.body.appendChild(container);

    // 4. Logic
    const bubble = document.getElementById('zuri-bubble');
    const chatWindow = document.getElementById('zuri-chat-window');
    const closeBtn = document.getElementById('zuri-close-btn');
    const input = document.getElementById('zuri-input');
    const sendBtn = document.getElementById('zuri-send-btn');
    const messages = document.getElementById('zuri-messages');

    bubble.onclick = () => {
        chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
    };

    closeBtn.onclick = () => chatWindow.style.display = 'none';

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        // Add user message
        addMessage(text, 'user');
        input.value = '';

        // Typing indicator
        const loadingMsg = addMessage('...', 'ai');

        try {
            const res = await fetch(`${apiUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Zuri-Hotel-Id': hotelId },
                body: JSON.stringify({ message: text, hotel_id: hotelId })
            });
            const data = await res.json();
            
            messages.removeChild(loadingMsg);
            addMessage(data.response, 'ai');
        } catch (err) {
            messages.removeChild(loadingMsg);
            addMessage("Sorry, I'm having trouble connecting right now.", 'ai');
        }
    }

    function addMessage(text, type) {
        const div = document.createElement('div');
        div.className = `zuri-msg ${type}`;
        div.innerText = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        return div;
    }

    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

})();
