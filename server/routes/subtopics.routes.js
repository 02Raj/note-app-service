const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth.middleware");

const {
  create,
  getAll,
  getByTopic,
  remove,
} = require("../controllers/subtopics.controller");

router.post("/", authenticate, create);
router.get("/", authenticate, getAll);
router.get("/topic/:topicId", authenticate, getByTopic);
router.delete("/:id", authenticate, remove);

module.exports = router;
