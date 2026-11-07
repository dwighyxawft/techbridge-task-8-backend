/* Search route, mounted at /api/search
     GET /api/search?q=javascript  -> matching tasks AND challenges
   Used by the search box in the platform header. */

const express = require("express");
const store = require("../services/taskStore");
const challengeRoutes = require("./challenges");

const router = express.Router();

function taskMatches(task, text) {
  const haystack = [
    `task ${task.id}`,
    task.title,
    task.description,
    task.difficulty,
    task.status.replace("-", " "),
    task.build.join(" ")
  ].join(" ").toLowerCase();
  return haystack.includes(text.toLowerCase());
}

router.get("/", (req, res) => {
  const q = String(req.query.q || "").trim();
  if (q.length < 2) {
    return res.status(400).json({ error: "Type at least 2 characters, for example /api/search?q=javascript" });
  }

  const tasks = store.getAll().filter((task) => taskMatches(task, q));
  const challenges = challengeRoutes.challenges.filter((item) => challengeRoutes.matchesText(item, q));

  res.json({
    query: q,
    total: tasks.length + challenges.length,
    tasks: tasks.map((t) => ({ id: t.id, title: t.title, description: t.description, status: t.status, day: t.day })),
    challenges: challenges.map((c) => ({ id: c.id, name: c.name, track: c.track, difficulty: c.difficulty, summary: c.summary }))
  });
});

module.exports = router;
