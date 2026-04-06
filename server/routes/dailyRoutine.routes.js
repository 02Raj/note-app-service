const express = require("express");
const router = express.Router();

const {
  createTemplate,
  getTemplates,
  updateTemplate,
  deactivateTemplate,
  getTodayLog,
  getLogByDate,
  addCustomTask,
  toggleTask,
  getRecentLogs,
  getStreak,
  generateInsight,
} = require("../controllers/dailyRoutine.controller");

const {
  dashboard,
  eodSummary,
  weeklyPattern,
  focusTask,
  jobReadiness,
} = require("../controllers/daily-routine-dashboard.controller");

const authenticate = require("../middlewares/auth.middleware");

// All routes protected
router.use(authenticate);

// ── Templates ──────────────────────────────────────────
router.post("/templates", createTemplate);
router.get("/templates", getTemplates);
router.patch("/templates/:templateId", updateTemplate);
router.delete("/templates/:templateId", deactivateTemplate);

// ── Dashboard ──────────────────────────────────────────
router.get("/dashboard", dashboard);
router.get("/dashboard/eod", eodSummary);
router.get("/dashboard/pattern", weeklyPattern);
router.get("/dashboard/focus", focusTask);
router.get("/dashboard/job-readiness", jobReadiness);

// ── Today's Log ────────────────────────────────────────
router.get("/today", getTodayLog);
router.post("/today/task", addCustomTask);

// ── Log by Date ────────────────────────────────────────
router.get("/log/:date", getLogByDate);
router.patch("/log/:date/task/:taskIndex/toggle", toggleTask);

// ── Stats & Streak ─────────────────────────────────────
router.get("/recent", getRecentLogs);
router.get("/streak", getStreak);

// ── Gemini Insight ─────────────────────────────────────
router.post("/log/:date/insight", generateInsight);

module.exports = router;