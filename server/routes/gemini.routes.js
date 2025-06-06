// /routes/gemini.routes.js

const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/gemini.controller');
const authMiddleware = require('../middlewares/auth.middleware');


router.get('/track-preparation', authMiddleware, geminiController.trackPreparation);

module.exports = router;