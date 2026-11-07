/* ==========================================================
   TechBridge Intern Management Platform: backend
   Node.js + Express

   API (all return JSON):
     GET  /api/health            is the backend running?
     GET  /api/summary           progress numbers + challenge counts
     GET  /api/tasks             all tasks
     GET  /api/tasks/:id         one task
     PUT  /api/tasks/:id         update a task's status
     GET  /api/challenges        all challenges (optional ?track= &difficulty= &q=)
     GET  /api/challenges/:id    one challenge
     GET  /api/search?q=text     search tasks and challenges
     POST /api/reset             put every task back to its starting status

   This server also serves the website, so one command runs everything:
     frontend/  ->  http://localhost:3000/
     assets/    ->  http://localhost:3000/assets/
   ========================================================== */

const express = require("express");
const path = require("path");

const taskRoutes = require("./routes/tasks");
const challengeRoutes = require("./routes/challenges");
const searchRoutes = require("./routes/search");
const summaryRoutes = require("./routes/summary");
const store = require("./services/taskStore");

const app = express();

const PORT = process.env.PORT || 3000;
// Optional: slow the API down on purpose so you can see the loading messages.
//   Windows PowerShell:  $env:DELAY_MS=1200; npm start
//   Windows CMD:         set DELAY_MS=1200 && npm start
//   Mac / Linux:         DELAY_MS=1200 npm start
const DELAY_MS = Number(process.env.DELAY_MS) || 0;

const FRONTEND_DIR = path.join(__dirname, "..", "frontend");
const ASSETS_DIR = path.join(__dirname, "..", "assets");

/* ----------------------------------------------------------
   Middleware (runs on every request, in this order)
   ---------------------------------------------------------- */

// 1. Print each request, so you can watch the frontend talking to the backend.
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()}  ${req.method} ${req.originalUrl}`);
  next();
});

// 2. Let other addresses (for example VS Code Live Server on port 5500) call this API.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// 3. Optional delay for API calls only.
app.use("/api", (req, res, next) => {
  if (DELAY_MS > 0) {
    setTimeout(next, DELAY_MS);
  } else {
    next();
  }
});

// 4. Read JSON sent in a request body (needed for PUT).
app.use(express.json());

/* ----------------------------------------------------------
   API routes
   ---------------------------------------------------------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", tasks: store.getAll().length });
});

app.use("/api/tasks", taskRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/summary", summaryRoutes);

app.post("/api/reset", (req, res) => {
  res.json({ message: "Tasks reset to their starting statuses.", tasks: store.reset() });
});

// Any other /api address does not exist.
app.use("/api", (req, res) => {
  res.status(404).json({ error: `No such API route: ${req.method} ${req.originalUrl}` });
});

/* ----------------------------------------------------------
   The website
   ---------------------------------------------------------- */
app.use("/assets", express.static(ASSETS_DIR));
app.use(express.static(FRONTEND_DIR));

/* ----------------------------------------------------------
   Error handler: a JSON message instead of a crash page
   ---------------------------------------------------------- */
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "The request body is not valid JSON." });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log("");
  console.log("  TechBridge Intern Management Platform is running");
  console.log(`  Website  : http://localhost:${PORT}`);
  console.log(`  Dashboard: http://localhost:${PORT}/dashboard.html`);
  console.log(`  API      : http://localhost:${PORT}/api/tasks`);
  if (DELAY_MS > 0) {
    console.log(`  (API responses are delayed by ${DELAY_MS} ms)`);
  }
  console.log("");
});
