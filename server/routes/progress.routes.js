const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth.middleware");
const { updateProgress, getUserProgress } = require("../controllers/progress.controller");

router.post("/", authenticate, updateProgress);
router.get("/", authenticate, getUserProgress);

module.exports = router;
