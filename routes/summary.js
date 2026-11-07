/* Summary route, mounted at /api/summary
     GET /api/summary -> progress numbers and challenge counts in one small response.
   The landing page uses it for the "internship at a glance" card. */

const express = require("express");
const store = require("../services/taskStore");
const challengeRoutes = require("./challenges");

const router = express.Router();

router.get("/", (req, res) => {
  const tasks = store.getAll();
  const completed = tasks.filter((t) => t.status === "completed").length;
  const current = tasks.find((t) => t.status === "in-progress") || null;
  const challenges = challengeRoutes.challenges;

  res.json({
    totalTasks: tasks.length,
    completed,
    remaining: tasks.length - completed,
    percent: tasks.length ? Math.round((completed / tasks.length) * 1000) / 10 : 0,
    currentTask: current ? { id: current.id, title: current.title, day: current.day } : null,
    challenges: {
      total: challenges.length,
      data: challenges.filter((c) => c.track === "data").length,
      web: challenges.filter((c) => c.track === "web").length
    }
  });
});

module.exports = router;
