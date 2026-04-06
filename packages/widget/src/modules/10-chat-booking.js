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

        const sentences = normalized.match(/[^.!?]+[.!?]?/g) || [normalized];
        const chunks = [];
        let current = '';
        let searchStart = 0;

        for (const sentence of sentences) {
            const trimmed = sentence.trim();
            if (!trimmed) continue;

            const candidate = current ? `${current} ${trimmed}` : trimmed;
            if (candidate.length <= maxChars) {
                current = candidate;
                continue;
            }

            if (current) {
                const start = normalized.indexOf(current, searchStart);
                chunks.push({
                    text: current,
                    start: start >= 0 ? start : searchStart,
                });
                searchStart = (start >= 0 ? start : searchStart) + current.length;
            }
            current = trimmed;
        }

        if (current) {
            const start = normalized.indexOf(current, searchStart);
            chunks.push({
                text: current,
                start: start >= 0 ? start : searchStart,
            });
        }

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
        const code = escapeHtml(booking.confirmation_code || 'ZUR-UNKNOWN');
        const rawCode = booking.confirmation_code || 'ZUR-UNKNOWN';
        const html = `
            <div class="zuri-booking-card" id="zbc-${code}">
                <div class="zuri-booking-card-header">
                    <div class="zuri-booking-card-title">Booking Confirmed</div>
                    <button class="zuri-booking-card-dismiss" data-dismiss="zbc-${code}" title="Dismiss">✕</button>
                </div>
                <div class="zuri-booking-card-code-row">
                    <span class="zuri-booking-card-code" id="zbc-code-${code}">${code}</span>
                    <button class="zuri-booking-card-copy" data-code="${rawCode}" title="Copy code">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                        Copy
                    </button>
                </div>
                <div class="zuri-booking-card-meta">${escapeHtml(booking.service || 'Reservation')} · ${escapeHtml(booking.date || 'TBD')} at ${escapeHtml(booking.time || 'TBD')}</div>
            </div>
        `;
        const msgEl = addMessage('', 'ai', { html });
        // Wire up copy button
        const copyBtn = msgEl && msgEl.querySelector('.zuri-booking-card-copy');
        if (copyBtn) {
            copyBtn.onclick = () => {
                const toCopy = copyBtn.getAttribute('data-code') || '';
                navigator.clipboard.writeText(toCopy).then(() => {
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => { copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy'; }, 2000);
                }).catch(() => {
                    // Fallback for older browsers
                    const el = document.createElement('textarea');
                    el.value = toCopy;
                    el.style.position = 'fixed';
                    el.style.opacity = '0';
                    document.body.appendChild(el);
                    el.focus();
                    el.select();
                    try { document.execCommand('copy'); copyBtn.textContent = 'Copied!'; setTimeout(() => { copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy'; }, 2000); } catch(_){}
                    document.body.removeChild(el);
                });
            };
        }
        // Wire up dismiss button
        const dismissBtn = msgEl && msgEl.querySelector('.zuri-booking-card-dismiss');
        if (dismissBtn) {
            dismissBtn.onclick = () => {
                if (msgEl && msgEl.parentNode) msgEl.parentNode.removeChild(msgEl);
            };
        }
    }

    function syncCancelModalState() {
        if (!cancelModalConfirm || !cancelModalInput) return;
        cancelModalConfirm.disabled = !cancelModalInput.value.trim();
    }

    function closeCancelModal() {
        pendingCancellationCode = null;
        if (cancelModal) cancelModal.classList.remove('show');
        if (cancelModalInput) cancelModalInput.value = '';
        if (cancelModalError) cancelModalError.textContent = '';
        syncCancelModalState();
        if (lastCancelTrigger) {
            lastCancelTrigger.disabled = false;
            lastCancelTrigger.focus();
            lastCancelTrigger = null;
        }
    }

    function openCancelModal(confirmationCode, triggerEl) {
        pendingCancellationCode = confirmationCode;
        lastCancelTrigger = triggerEl || null;
        if (cancelModalCode) cancelModalCode.textContent = confirmationCode;
        if (cancelModalInput) cancelModalInput.value = '';
        if (cancelModalError) cancelModalError.textContent = '';
        if (cancelModal) cancelModal.classList.add('show');
        syncCancelModalState();
        if (cancelModalClose) cancelModalClose.focus();
    }

    function clearBookingSyncHideTimer() {
        if (!bookingSyncHideTimer) return;
        clearTimeout(bookingSyncHideTimer);
        bookingSyncHideTimer = null;
    }

    function hideBookingSyncPanel() {
        bookingSyncVisible = false;
        clearBookingSyncHideTimer();
        if (bookingSyncPanel) bookingSyncPanel.classList.remove('show');
    }

    function showBookingSyncPanelTemporarily() {
        bookingSyncVisible = true;
        renderBookingSyncPanel();
        clearBookingSyncHideTimer();
        bookingSyncHideTimer = setTimeout(() => {
            hideBookingSyncPanel();
        }, BOOKING_SYNC_AUTO_HIDE_MS);
    }

    function renderBookingSyncPanel() {
        if (!bookingSyncPanel || !bookingSyncList) return;
        const bookings = loadBookings();
        bookingsByCode.clear();
        if (!bookings.length) {
            hideBookingSyncPanel();
            bookingSyncList.innerHTML = '';
            return;
        }

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
                        : `<button class="zuri-booking-sync-cancel" data-code="${escapeHtml(b.confirmation_code || '')}" aria-label="Cancel reservation ${escapeHtml(b.confirmation_code || 'booking')}">Cancel Booking</button>`}
                </div>
            </div>
        `).join('');

        bookingSyncList.querySelectorAll('.zuri-booking-sync-cancel').forEach((btn) => {
            btn.onclick = () => {
                const code = (btn.getAttribute('data-code') || '').toUpperCase();
                if (!code) return;
                openCancelModal(code, btn);
            };
        });

        bookingSyncPanel.classList.toggle('show', bookingSyncVisible);
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

        if (cancelledBookingTimers.has(normalized)) {
            clearTimeout(cancelledBookingTimers.get(normalized));
        }
        cancelledBookingTimers.set(normalized, setTimeout(() => {
            const bookingsAfterDelay = loadBookings().filter(
                (b) => (b.confirmation_code || '').toUpperCase() !== normalized
            );
            saveBookings(bookingsAfterDelay);
            renderBookingSyncPanel();
            cancelledBookingTimers.delete(normalized);
        }, CANCELLED_BOOKING_HIDE_DELAY_MS));
    }

    async function cancelBookingFromWidget(confirmationCode, guestName) {
        const booking = bookingsByCode.get((confirmationCode || '').toUpperCase());
        if (!booking) return;

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

            closeCancelModal();
            markBookingCancelledLocally(confirmationCode);
            addMessage(`Booking ${confirmationCode} has been cancelled successfully.`, 'ai');
        } catch (err) {
            if (cancelModalError) {
                cancelModalError.textContent = err instanceof Error ? err.message : 'Cancellation failed. Please try again.';
            }
            if (cancelModalConfirm) cancelModalConfirm.disabled = false;
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
        showBookingSyncPanelTemporarily();

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

