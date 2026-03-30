# Widget Source Layout

The browser-served widget bundle is `src/zuri-widget.js`.

To keep maintenance manageable, source is split into ordered modules under:
- `src/modules/00-bootstrap.js`
- `src/modules/10-chat-booking.js`
- `src/modules/20-transport.js`
- `src/modules/30-voice.js`

Rebuild the bundle after edits:

```bash
python packages/widget/scripts/build_widget.py
```

`/api/embed/widget.js` serves `packages/widget/src/zuri-widget.js`, so rebuild before shipping widget changes.
