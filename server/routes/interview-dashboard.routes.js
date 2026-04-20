const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const interviewDashboardController = require("../controllers/interview-dashboard.controller");

const router = express.Router();

router.use(authMiddleware);

router.post("/plan", interviewDashboardController.setupPlan);
router.get("/overview", interviewDashboardController.getOverview);
router.get("/notes", interviewDashboardController.getNotesDashboard);
router.get("/revision", interviewDashboardController.getRevisionDashboard);
router.get("/dsa", interviewDashboardController.getDsaDashboard);

module.exports = router;
