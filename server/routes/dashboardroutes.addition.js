// Add these lines to your existing dailyRoutine.routes.js
// (after the existing router.use(verifyToken) line)

const {
  dashboard,
  eodSummary,
  weeklyPattern,
  focusTask,
  jobReadiness,
} = require("../controllers/daily-routine-dashboard.controller");

// ── Dashboard routes ───────────────────────────────────────
router.get("/dashboard", dashboard);                    // Full dashboard — ek call mein sab
router.get("/dashboard/eod", eodSummary);              // EOD honest summary
router.get("/dashboard/pattern", weeklyPattern);        // Weekly pattern analysis
router.get("/dashboard/focus", focusTask);             // Focus mode — abhi ye karo
router.get("/dashboard/job-readiness", jobReadiness);  // Placement readiness score