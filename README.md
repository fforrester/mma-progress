# MMA Progress

A deliberately small personal MMA training tracker.

## File map

The project is split so each file has one clear job:

- `index.html` — the screen structure, from top to bottom.
- `style.css` — colours, spacing, cards, buttons and responsive layout.
- `app.js` — filters, calculations, adding/deleting sessions and rendering.
- `storage.js` — localStorage, backup export and backup restore.
- `manifest.webmanifest` — installable web-app settings.
- `sw.js` — caches the app files for offline loading.
- `icon-192.png` / `icon-512.png` — app icons.
- `.gitignore` — tells Git not to track unwanted local files.

## How the data works

GitHub Pages hosts the **app code**.

Your live training records are stored on the device in browser `localStorage`
under the key:

`mma-progress-sessions-v1`

The public source code contains no personal training history.

Use **Export backup** to create a JSON copy and save it to OneDrive or another
cloud drive. Use **Restore backup** to bring that data back into the app.

## How to read the code

If you are trying to understand the app, read it in this order:

1. `index.html` — see what appears on screen.
2. `style.css` — see how the screen is styled.
3. `app.js` — follow what happens when buttons are pressed.
4. `storage.js` — see exactly how data is saved and backed up.
5. `sw.js` — see how offline caching works.

## Publishing changes

From the project directory:

```bash
git status
git add .
git commit -m "Describe the change"
git push
```

GitHub Pages will then publish the updated files from the `main` branch.
