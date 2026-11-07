/* Challenge routes, mounted at /api/challenges
     GET /api/challenges        -> all challenges
                                   optional filters: ?track=data|web  &difficulty=Beginner|Intermediate|Advanced  &q=text
     GET /api/challenges/:id    -> one challenge, for example /api/challenges/contact-form  */

const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const challenges = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "challenges.json"), "utf8"));

const TRACK_NAMES = { data: "Data Analytics", web: "Web Development" };

// Does a challenge contain the search text anywhere useful?
function matchesText(challenge, text) {
  const haystack = [
    challenge.name,
    challenge.summary,
    TRACK_NAMES[challenge.track],
    challenge.difficulty,
    challenge.skills.join(" "),
    challenge.tools.join(" ")
  ].join(" ").toLowerCase();
  return haystack.includes(text.toLowerCase());
}

router.get("/", (req, res) => {
  const { track, difficulty, q } = req.query;
  let list = challenges;

  if (track) {
    list = list.filter((challenge) => challenge.track === track);
  }
  if (difficulty) {
    list = list.filter((challenge) => challenge.difficulty === difficulty);
  }
  if (q) {
    list = list.filter((challenge) => matchesText(challenge, String(q)));
  }
  res.json(list);
});

router.get("/:id", (req, res) => {
  const challenge = challenges.find((item) => item.id === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: `Challenge "${req.params.id}" was not found.` });
  }
  res.json(challenge);
});

module.exports = router;
module.exports.matchesText = matchesText;
module.exports.challenges = challenges;
