    // == Toggle Chat =============================================
    function renderChatGreeting() {
        msgBox.innerHTML = '';
        addMessage("Hello! I'm Zuri, your AI concierge. How can I help you today?", 'ai');
    }

    function resetChatSession() {
        chatHistory = [];
        input.value = '';
        renderChatGreeting();
    }

    function openChat() {
        chatWin.style.display = 'flex';
        if (!msgBox.children.length) renderChatGreeting();
    }

    function closeChat() {
        chatWin.style.display = 'none';
        exitVoiceMode();
        resetChatSession();
    }

    bubble.onclick = () => {
        if (chatWin.style.display === 'flex') {
            closeChat();
            return;
        }
        openChat();
    };
    closeBtn.onclick = () => closeChat();

    // == Message Helpers =========================================
    function addMessage(text, type, opts = {}) {
        const div = document.createElement('div');
        div.className = `zuri-msg ${type}`;
        if (opts.ghost) div.classList.add('ghost');

        if (opts.html) {
            div.innerHTML = opts.html;
        } else if (type === 'ai' && !opts.raw) {
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

    function clearVoiceCaptionRotation() {
        if (!voiceCaptionTimer) return;
        clearInterval(voiceCaptionTimer);
        voiceCaptionTimer = null;
    }

    function splitCaptionChunks(text, maxChars = 140) {
        const normalized = String(text || '').replace(/\s+/g, ' ').trim();
        if (!normalized) return [];
        const words = normalized.split(' ');
        const chunks = [];
        let current = '';

        for (const word of words) {
            const candidate = current ? `${current} ${word}` : word;
            if (candidate.length <= maxChars) {
                current = candidate;
                continue;
            }
            if (current) chunks.push(current);
            current = word;
        }

        if (current) chunks.push(current);
        return chunks;
    }

    function setVoiceCaption(text, opts = {}) {
        liveCaption.className = `zuri-live-caption${opts.interim ? ' interim' : ''}`;
        if (opts.markdown) {
            liveCaption.innerHTML = md(text);
            return;
        }
        liveCaption.textContent = text;
    }

    function rotateVoiceCaption(text) {
        clearVoiceCaptionRotation();
        const chunks = splitCaptionChunks(text);
        if (!chunks.length) {
            setVoiceCaption('');
            return;
        }

        let idx = 0;
        setVoiceCaption(chunks[idx], { markdown: true });
        if (chunks.length === 1) return;

        voiceCaptionTimer = setInterval(() => {
            idx += 1;
            if (idx >= chunks.length) idx = 0;
            setVoiceCaption(chunks[idx], { markdown: true });
        }, 2200);
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
        } catch (_) {}
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
        addMessage('', 'ai', { html });
    }

    function renderBookingSyncPanel() {
        if (!bookingSyncPanel || !bookingSyncList) return;
        const bookings = loadBookings();
        bookingsByCode.clear();
        if (!bookings.length) {
            bookingSyncPanel.classList.remove('show');
            bookingSyncList.innerHTML = '';
            return;
        }

        bookingSyncPanel.classList.add('show');
        const items = bookings.slice(0, 6);
        for (const booking of items) {
            bookingsByCode.set((booking.confirmation_code || '').toUpperCase(), booking);
        }

        bookingSyncList.innerHTML = items.map((b) => `
            <div class="zuri-booking-sync-item">
                <div class="zuri-booking-sync-code">${escapeHtml(b.confirmation_code || 'ZUR-UNKNOWN')}</div>
                <div class="zuri-booking-sync-meta">${escapeHtml(b.service || 'Reservation')} • ${escapeHtml(b.date || 'TBD')} ${escapeHtml(b.time || 'TBD')}</div>
                <div class="zuri-booking-sync-time">Added ${escapeHtml(new Date(b.created_at || Date.now()).toLocaleString())}</div>
                <div class="zuri-booking-sync-footer">
                    <span class="zuri-booking-sync-status ${String(b.status || '').toLowerCase() === 'cancelled' ? 'cancelled' : ''}">
                        ${escapeHtml(b.status || 'Confirmed')}
                    </span>
                    ${String(b.status || '').toLowerCase() === 'cancelled'
                        ? ''
                        : `<button class="zuri-booking-sync-cancel" data-code="${escapeHtml(b.confirmation_code || '')}">Cancel</button>`}
                </div>
            </div>
        `).join('');

        bookingSyncList.querySelectorAll('.zuri-booking-sync-cancel').forEach((btn) => {
            btn.onclick = () => {
                const code = (btn.getAttribute('data-code') || '').toUpperCase();
                if (!code) return;
                cancelBookingFromWidget(code, btn);
            };
        });
    }

    function markBookingCancelledLocally(code) {
        const normalized = (code || '').toUpperCase();
        if (!normalized) return;
        const bookings = loadBookings();
        const updated = bookings.map((b) => {
            if ((b.confirmation_code || '').toUpperCase() !== normalized) return b;
            return { ...b, status: 'Cancelled' };
        });
        saveBookings(updated);
        renderBookingSyncPanel();
    }

    async function cancelBookingFromWidget(confirmationCode, btnEl) {
        const booking = bookingsByCode.get((confirmationCode || '').toUpperCase());
        if (!booking) return;

        const guestName = window.prompt(
            `To cancel ${confirmationCode}, enter the guest full name exactly as booked:`,
            booking.guest_name || ''
        );
        if (!guestName || !guestName.trim()) return;

        if (btnEl) {
            btnEl.disabled = true;
        }

        try {
            const res = await fetch(`${apiUrl}/api/bookings/public/cancel?hotel_id=${encodeURIComponent(hotelId)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Zuri-Hotel-Id': hotelId,
                },
                body: JSON.stringify({
                    confirmation_code: confirmationCode,
                    guest_name: guestName.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.detail || 'Unable to cancel booking right now.');
            }

            markBookingCancelledLocally(confirmationCode);
            addMessage(`Booking ${confirmationCode} has been cancelled successfully.`, 'ai');
        } catch (err) {
            addMessage(
                err instanceof Error
                    ? `Cancellation failed: ${err.message}`
                    : 'Cancellation failed. Please try again.',
                'ai'
            );
        } finally {
            if (btnEl) btnEl.disabled = false;
        }
    }

    function publishBookingSync(booking) {
        const normalized = normalizeBooking(booking);
        if (!normalized) return;
        const existing = loadBookings();
        const deduped = [
            normalized,
            ...existing.filter((item) => item.confirmation_code !== normalized.confirmation_code)
        ].filter(Boolean);
        saveBookings(deduped);
        renderBookingSyncPanel();

        const detail = { hotelId, booking, bookings: deduped.slice(0, BOOKING_STORE_MAX) };
        window.dispatchEvent(new CustomEvent('zuri:booking:created', { detail }));
        window.ZuriBookingSync = { hotelId, getBookings: () => loadBookings() };
    }

    window.addEventListener('storage', (event) => {
        if (event.key === BOOKING_STORE_KEY) renderBookingSyncPanel();
    });

    renderBookingSyncPanel();
    renderChatGreeting();

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
            const merged = [...remoteNormalized];
            const seen = new Set(remoteNormalized.map((b) => b.confirmation_code));
            for (const b of local) {
                if (!seen.has(b.confirmation_code)) merged.push(b);
            }
            saveBookings(merged);
            renderBookingSyncPanel();
        } catch (_) {}
    }

    syncBookingsFromServer();
    bookingSyncTimer = setInterval(syncBookingsFromServer, BOOKING_SYNC_POLL_MS);

