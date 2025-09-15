const express = require('express');
const router = express.Router();
const mockInterviewCtrl = require('../controllers/mockInterview.controller.js');

router.post('/start', mockInterviewCtrl.startInterview);
router.post('/answer', mockInterviewCtrl.submitAnswer);
router.get('/results/:sessionId', mockInterviewCtrl.getResults);
router.post('/pause', mockInterviewCtrl.pauseInterview);
router.post('/resume', mockInterviewCtrl.resumeInterview);
router.get('/history/:userId', mockInterviewCtrl.getInterviewHistory);

module.exports = router;
