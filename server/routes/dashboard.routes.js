// /routes/dashboard.routes.js

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// This middleware will ensure that only a logged-in user can see their stats
router.use(authMiddleware);

// Route to get dashboard statistics
// GET /api/dashboard/stats
router.get('/stats', dashboardController.getStats);

module.exports = router;