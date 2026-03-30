# Kuriftu Embed Instruction Guide

Use this guide to run Kuriftu with the Zuri embed script only. No manual sync button is required.

## 1) Resort Setup

1. Create or log in to the Kuriftu resort tenant in Zuri Panel.
2. Set `allowed_domains` in Widget Access Control to your Kuriftu site domains.
3. Upload `data/kuriftu/knowledge.txt` in the Knowledge section.
4. Add rooms/services from:
   - `data/kuriftu/rooms.txt`
   - `data/kuriftu/services.txt`

## 2) Embed Script

Paste this before `</body>` on the Kuriftu website:

```html
<script
  src="http://localhost:8000/api/embed/widget.js"
  data-hotel-id="kuriftu"
  data-api-url="http://localhost:8000"
  async
></script>
```

For production, replace `http://localhost:8000` with your deployed API URL.

## 3) What Happens Automatically

- Agent booking confirmations are detected automatically from chat responses.
- Booking sync events are emitted automatically from the script:
  - `window` event: `zuri:booking:created`
- Booking data is persisted in browser storage automatically.
- A lightweight on-page bookings panel appears automatically after successful bookings.

No user action is needed to sync.

## 4) Test Flow

1. Open Kuriftu site with embedded widget.
2. Ask agent to book a room/service with complete details.
3. Confirm response includes a confirmation code (for example `ZUR-0001`).
4. Verify the booking sync panel updates automatically.
5. Refresh page and confirm the synced booking remains visible.

## 5) Production Pattern (Recommended)

For enterprise rollout, keep this embed behavior and add:

- Server webhooks for booking-created/updated events
- Realtime stream (WebSocket/SSE) for multi-device sync
- Event consumers in web/app/admin dashboards

