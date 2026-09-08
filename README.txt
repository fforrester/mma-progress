MMA Progress — iPhone web app

What it does:
- Preloads your existing 20 sessions / 21h 15m
- Logs date, discipline and duration
- Shows week, month, year and all-time totals
- Shows discipline breakdown and history
- Saves current data on the device
- Exports dated JSON backups
- Restores a JSON backup after validating it

GitHub Pages setup:
1. Create a new repository such as mma-progress.
2. Upload index.html, manifest.webmanifest, sw.js, icon-192.png and icon-512.png to the repository root.
3. Open Settings > Pages.
4. Choose Deploy from a branch, main, /(root), then Save.
5. Open the Pages URL in Safari on iPhone.
6. Share > Add to Home Screen > Open as Web App (if shown) > Add.

Backup routine:
1. In MMA Progress tap Export backup.
2. Save the JSON file into Files > iCloud Drive > MMA Progress.
3. Keep occasional dated backups.

Restore routine:
1. Tap Restore backup.
2. Choose a mma-progress-backup-YYYY-MM-DD.json file from iCloud Drive.
3. Confirm the restore. The selected backup replaces the app data on that device.

Important:
GitHub hosts the app code, not your changing training records. Your working data is stored in browser storage on the device, so keep iCloud backups.
