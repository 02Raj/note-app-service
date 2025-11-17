const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth.middleware");

const {
  create,
  getAll,
  getByTopic,
  getBySubtopic,
  remove,
  update,
  restore,           // 👈 IMPORT RESTORE
} = require("../controllers/notes.controller");

// routes
router.post("/", authenticate, create);
router.put("/:id", authenticate, update);
router.get("/", authenticate, getAll);
router.get("/topic/:topicId", authenticate, getByTopic);
router.get("/subtopic/:subtopicId", authenticate, getBySubtopic);
router.delete("/:id", authenticate, remove);

// ⚠️ NEW ROUTE (Restore Deleted Note)
router.post("/restore/:id", authenticate, restore);

module.exports = router;
