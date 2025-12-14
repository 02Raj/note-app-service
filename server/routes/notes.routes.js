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
  explainNote 
} = require("../controllers/notes.controller");

router.post("/", authenticate, create);
router.put("/:id", authenticate, update); 
router.get("/", authenticate, getAll);
router.get("/topic/:topicId", authenticate, getByTopic);
router.get("/subtopic/:subtopicId", authenticate, getBySubtopic);
router.delete("/:id", authenticate, remove);

/**
 * NEW ROUTE
 * Note ko AI se explain karne ke liye
 */
router.post("/note-explain", authenticate, explainNote);
module.exports = router;
