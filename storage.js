/* =========================================================
   MMA PROGRESS — DATA STORAGE + BACKUPS

   This file answers:
   1. Where are sessions stored?
   2. How are they saved?
   3. How are backups exported/restored?

   The live copy is stored in browser localStorage.
   ========================================================= */

const STORAGE_KEY = "mma-progress-sessions-v1";

/* The public app starts blank.
   Your private historical sessions are restored from your JSON backup. */
const STARTER_SESSIONS = [];


/* ---------- LOAD DATA FROM THIS DEVICE ---------- */

function loadSessions() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [...STARTER_SESSIONS];
  } catch {
    return [...STARTER_SESSIONS];
  }
}


/* ---------- SAVE DATA TO THIS DEVICE ---------- */

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}


/* ---------- EXPORT A JSON BACKUP ---------- */

function exportBackup(sessions) {
  const backupText = JSON.stringify(sessions, null, 2);
  const blob = new Blob([backupText], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `mma-progress-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();

  URL.revokeObjectURL(url);
}


/* ---------- CHECK THAT A RESTORE FILE IS VALID ---------- */

function isValidBackup(data, allowedTypes) {
  return Array.isArray(data) && data.every(session =>
    session &&
    typeof session.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(session.date) &&
    allowedTypes.includes(session.discipline) &&
    Number.isInteger(session.minutes) &&
    session.minutes > 0 &&
    session.minutes <= 360
  );
}


/* ---------- READ A JSON BACKUP FILE ---------- */

async function readBackupFile(file, allowedTypes) {
  const parsed = JSON.parse(await file.text());

  if (!isValidBackup(parsed, allowedTypes)) {
    throw new Error("Invalid MMA Progress backup");
  }

  /* Make sure every restored session has an ID. */
  return parsed.map((session, index) => ({
    id: Number.isInteger(session.id) ? session.id : index + 1,
    date: session.date,
    discipline: session.discipline,
    minutes: session.minutes
  }));
}
