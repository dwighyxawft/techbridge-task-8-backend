/* Task routes, mounted at /api/tasks
     GET /api/tasks       -> all tasks
     GET /api/tasks/:id   -> one task
     PUT /api/tasks/:id   -> update a task's status  { "status": "completed" }  */

const express = require("express");
const store = require("../services/taskStore");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(store.getAll());
});

router.get("/:id", (req, res) => {
  const task = store.getById(Number(req.params.id));
  if (!task) {
    return res.status(404).json({ error: `Task ${req.params.id} was not found.` });
  }
  res.json(task);
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!store.getById(id)) {
    return res.status(404).json({ error: `Task ${req.params.id} was not found.` });
  }

  const status = req.body && req.body.status;
  if (!store.VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Use one of: ${store.VALID_STATUSES.join(", ")}.`
    });
  }

  res.json(store.updateStatus(id, status));
});

module.exports = router;
