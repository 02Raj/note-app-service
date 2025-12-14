// /routes/gemini.routes.js

const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/gemini.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const { explainNote } = require("../controllers/notes.controller");
// ⚠️ path check karo, controller file ka naam correct ho

router.post("/note-explain", explainNote);
router.get('/track-preparation', authMiddleware, geminiController.trackPreparation);

module.exports = router;