/* =========================================================
   MMA PROGRESS — MAIN APP LOGIC

   Read this file from top to bottom.

   It controls:
   - current sessions
   - filters
   - calculations
   - adding/deleting sessions
   - rendering the screen
   - backup/restore button behaviour
   ========================================================= */


/* ---------- APP SETTINGS ---------- */

const DISCIPLINES = [
  "Boxing",
  "MMA",
  "BJJ / Grappling",
  "Wrestling",
  "1-to-1"
];

let sessions = loadSessions();
let currentView = "all";
let selectedDuration = 60;


/* ---------- FIND ELEMENTS ON THE PAGE ---------- */

const $ = id => document.getElementById(id);

const viewButtons = [...document.querySelectorAll("[data-view]")];
const durationButtons = [...document.querySelectorAll("[data-minutes]")];


/* ---------- DEFAULT DATES ---------- */

const today = new Date().toISOString().slice(0, 10);
$("sessionDate").value = today;
$("anchorDate").value = today;


/* ---------- SMALL DATE / TIME HELPERS ---------- */

function parseDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toISO(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, numberOfDays) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + numberOfDays);
  return copy;
}

function formatDate(dateString) {
  return parseDate(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  });
}

function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (!hours) return `${remainder}m`;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}


/* ---------- WORK OUT THE SELECTED DATE RANGE ---------- */

function getPeriodBounds() {
  if (currentView === "all") {
    if (!sessions.length) {
      return { start: null, end: null, label: "All time" };
    }

    const dates = sessions.map(session => session.date).sort();

    return {
      start: dates[0],
      end: dates.at(-1),
      label: "All time"
    };
  }

  const anchor = parseDate($("anchorDate").value);

  if (currentView === "week") {
    const offsetFromMonday = (anchor.getUTCDay() + 6) % 7;
    const start = addDays(anchor, -offsetFromMonday);
    const end = addDays(start, 6);

    return {
      start: toISO(start),
      end: toISO(end),
      label: "Week"
    };
  }

  if (currentView === "month") {
    const start = new Date(Date.UTC(
      anchor.getUTCFullYear(),
      anchor.getUTCMonth(),
      1
    ));

    const end = new Date(Date.UTC(
      anchor.getUTCFullYear(),
      anchor.getUTCMonth() + 1,
      0
    ));

    return {
      start: toISO(start),
      end: toISO(end),
      label: anchor.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
        timeZone: "UTC"
      })
    };
  }

  /* Otherwise the selected view is Year. */
  const start = new Date(Date.UTC(anchor.getUTCFullYear(), 0, 1));
  const end = new Date(Date.UTC(anchor.getUTCFullYear(), 11, 31));

  return {
    start: toISO(start),
    end: toISO(end),
    label: String(anchor.getUTCFullYear())
  };
}


/* ---------- GET ONLY THE SESSIONS FOR THE SELECTED PERIOD ---------- */

function getSelectedSessions() {
  const bounds = getPeriodBounds();

  if (!bounds.start) return [];

  return sessions
    .filter(session =>
      session.date >= bounds.start &&
      session.date <= bounds.end
    )
    .sort((a, b) =>
      b.date.localeCompare(a.date) || b.id - a.id
    );
}


/* ---------- DRAW / REFRESH EVERYTHING ON SCREEN ---------- */

function render() {
  const bounds = getPeriodBounds();
  const selectedSessions = getSelectedSessions();

  const totalMinutes = selectedSessions.reduce(
    (total, session) => total + session.minutes,
    0
  );

  renderSummary(bounds, selectedSessions, totalMinutes);
  renderBreakdown(selectedSessions);
  renderHistory(selectedSessions);
}


/* ---------- DRAW THE SUMMARY CARDS ---------- */

function renderSummary(bounds, selectedSessions, totalMinutes) {
  $("periodLabel").textContent = bounds.label;

  $("totalSessions").textContent =
    `${selectedSessions.length} session${selectedSessions.length === 1 ? "" : "s"}`;

  $("totalTime").textContent = formatMinutes(totalMinutes);

  $("avgSession").textContent = selectedSessions.length
    ? formatMinutes(Math.round(totalMinutes / selectedSessions.length))
    : "0m";

  $("periodRange").textContent = bounds.start
    ? `${formatDate(bounds.start)} – ${formatDate(bounds.end)}`
    : "No sessions yet";
}


/* ---------- DRAW THE DISCIPLINE BREAKDOWN ---------- */

function renderBreakdown(selectedSessions) {
  $("breakdown").innerHTML = "";

  DISCIPLINES.forEach(discipline => {
    const matchingSessions = selectedSessions.filter(
      session => session.discipline === discipline
    );

    const minutes = matchingSessions.reduce(
      (total, session) => total + session.minutes,
      0
    );

    const row = document.createElement("div");
    row.className = "row";

    row.innerHTML = `
      <div>
        <strong>${discipline}</strong>
        <div class="muted">${formatMinutes(minutes)}</div>
      </div>

      <div class="right">
        <strong>${matchingSessions.length}</strong>
        <div class="muted">sessions</div>
      </div>
    `;

    $("breakdown").appendChild(row);
  });
}


/* ---------- DRAW SESSION HISTORY ---------- */

function renderHistory(selectedSessions) {
  $("history").innerHTML = "";

  if (!selectedSessions.length) {
    $("history").innerHTML =
      '<p class="muted">No sessions in this period.</p>';
    return;
  }

  selectedSessions.forEach(session => {
    const row = document.createElement("div");
    row.className = "row";

    const description = document.createElement("div");
    description.innerHTML = `
      <strong>${session.discipline}</strong>
      <div class="muted">
        ${formatDate(session.date)} · ${formatMinutes(session.minutes)}
      </div>
    `;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      sessions = sessions.filter(item => item.id !== session.id);
      saveSessions(sessions);
      render();
    });

    row.append(description, deleteButton);
    $("history").appendChild(row);
  });
}


/* ---------- PERIOD FILTER BUTTONS ---------- */

viewButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentView = button.dataset.view;

    viewButtons.forEach(item =>
      item.classList.toggle("active", item === button)
    );

    $("anchorWrap").classList.toggle(
      "hidden",
      currentView === "all"
    );

    render();
  });
});

$("anchorDate").addEventListener("change", render);


/* ---------- DURATION BUTTONS ---------- */

durationButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedDuration = Number(button.dataset.minutes);

    durationButtons.forEach(item =>
      item.classList.toggle("active", item === button)
    );
  });
});


/* ---------- ADD A NEW TRAINING SESSION ---------- */

$("addForm").addEventListener("submit", event => {
  event.preventDefault();

  const date = $("sessionDate").value;
  if (!date) return;

  const nextID = sessions.length
    ? Math.max(...sessions.map(session => session.id)) + 1
    : 1;

  const newSession = {
    id: nextID,
    date: date,
    discipline: $("discipline").value,
    minutes: selectedDuration
  };

  sessions.push(newSession);
  saveSessions(sessions);

  $("status").textContent = "Session added.";
  render();
});


/* ---------- EXPORT BACKUP ---------- */

$("exportBtn").addEventListener("click", () => {
  exportBackup(sessions);

  $("backupStatus").textContent =
    "Backup created. Save it to OneDrive or another cloud drive.";
});


/* ---------- RESTORE BACKUP ---------- */

$("restoreBtn").addEventListener("click", () => {
  $("restoreFile").click();
});

$("restoreFile").addEventListener("change", async event => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  try {
    const restoredSessions = await readBackupFile(file, DISCIPLINES);

    const confirmed = confirm(
      `Restore ${restoredSessions.length} sessions from this backup? ` +
      `This will replace the data currently stored on this device.`
    );

    if (!confirmed) {
      event.target.value = "";
      return;
    }

    sessions = restoredSessions;
    saveSessions(sessions);
    render();

    $("backupStatus").textContent =
      `Backup restored: ${sessions.length} sessions.`;

  } catch {
    $("backupStatus").textContent =
      "That file is not a valid MMA Progress backup.";
  }

  event.target.value = "";
});


/* ---------- CLEAR ALL LOCAL TRAINING DATA ---------- */

$("resetBtn").addEventListener("click", () => {
  const confirmed = confirm(
    "Clear all training data stored on this device?"
  );

  if (!confirmed) return;

  sessions = [];
  saveSessions(sessions);
  render();

  $("backupStatus").textContent =
    "All local training data cleared.";
});


/* ---------- ENABLE OFFLINE APP CACHING ---------- */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}


/* ---------- FIRST SCREEN DRAW ---------- */

render();
