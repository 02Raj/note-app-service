const express = require('express');
const router = express.Router();
const mockInterviewController = require('../controllers/mockInterview.controller.js');
// Aap auth.middleware.js ko yahaan laga sakte hain taaki sirf logged-in user hi isko access kar paaye
// const { protect } = require('../middlewares/auth.middleware.js');

// Naya mock interview session shuru karne ke liye route
// router.post('/start', protect, mockInterviewController.startInterview);
router.post('/start', mockInterviewController.startInterview);

// Interview ke dauraan jawaab submit karne ke liye route
// router.post('/submit', protect, mockInterviewController.submitAnswer);
router.post('/submit', mockInterviewController.submitAnswer);

// Interview poora hone par results/feedback paane ke liye route
// router.get('/results/:sessionId', protect, mockInterviewController.getResults);
router.get('/results/:sessionId', mockInterviewController.getResults);


module.exports = router;