Eminem Theme — Basic Audio Player

Quick start

- Open `index.html` in a browser (file input works without a server).
- Or run a local static server to serve files from this folder (useful if you want to place MP3s in `audio/`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Usage

- Click **Add Files** to pick MP3s from your `Music` folder (or drag & drop files onto the page). Files added this way are used locally via the browser and no copying is required.
- Controls: play/pause, previous, next, progress, and volume.

Notes & Legal

- This player is a simple local web UI and doesn't bypass DRM or licensing restrictions.
- Do not distribute copyrighted material without permission. This tool is for personal use with files you legally own.

If you want, I can copy tracks from `~/Music` into `audio/` for you and create a small `playlist.json`. Tell me if you want that and confirm the exact path to your files.
