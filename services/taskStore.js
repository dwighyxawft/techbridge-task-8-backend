/* ==========================================================
   Task store
   Keeps the internship tasks and their statuses.

   - data/tasks.json     the 8 tasks and their STARTING statuses (never changed by the app)
   - data/progress.json  the statuses an intern has changed (created automatically)

   Because progress is saved to a file, completed tasks are still
   completed after the server restarts. Reset removes that file.
   ========================================================== */

const fs = require("fs");
const path = require("path");

const TASKS_FILE = path.join(__dirname, "..", "data", "tasks.json");
const PROGRESS_FILE = path.join(__dirname, "..", "data", "progress.json");

const VALID_STATUSES = ["completed", "in-progress", "not-started"];

let tasks = [];

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    return fallback;
  }
}

// Keep one task marked "in-progress": if none is, the first unfinished task becomes it.
function keepOneTaskInProgress() {
  const hasCurrent = tasks.some((task) => task.status === "in-progress");
  if (!hasCurrent) {
    const next = tasks.find((task) => task.status === "not-started");
    if (next) {
      next.status = "in-progress";
    }
  }
}

function saveProgress() {
  const progress = {};
  tasks.forEach((task) => { progress[task.id] = task.status; });
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  } catch (error) {
    console.warn("Could not save progress:", error.message);   // the API still works, it just will not remember
  }
}

function load() {
  tasks = readJson(TASKS_FILE, []);
  const saved = readJson(PROGRESS_FILE, {});
  tasks.forEach((task) => {
    if (VALID_STATUSES.includes(saved[task.id])) {
      task.status = saved[task.id];
    }
  });
  keepOneTaskInProgress();
}

function getAll() {
  return tasks;
}

function getById(id) {
  return tasks.find((task) => task.id === id);
}

function updateStatus(id, status) {
  const task = getById(id);
  if (!task) {
    return null;
  }
  task.status = status;
  keepOneTaskInProgress();
  saveProgress();
  return task;
}

function reset() {
  try {
    fs.rmSync(PROGRESS_FILE, { force: true });
  } catch (error) {
    /* nothing to remove */
  }
  load();
  return tasks;
}

load();

module.exports = { VALID_STATUSES, getAll, getById, updateStatus, reset };
