const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller.js');
const { upload } = require('../middlewares/cloudinary.config');

// === YAHI HAI ASLI FIX ===
// Hum yahaan auth middleware ko seedhe import karenge, bina curly braces { } ke.
// Kyunki aapki file poore function ko export karti hai.
const authMiddleware = require('../middlewares/auth.middleware');

// Resume upload aur analyze karne ka route
router.post(
  '/analyze',
  authMiddleware, // Ab yeh seedhe function ko istemaal karega
  upload.single('resume'),
  resumeController.analyzeResume
);

module.exports = router;
