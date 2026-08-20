const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth.middleware");

const { search, mergeNotes } = require("../controllers/ai.controller");

// POST /api/ai/search
router.post("/search", authenticate, search);

// POST /api/ai/merge
router.post("/merge", authenticate, mergeNotes);

module.exports = router;
