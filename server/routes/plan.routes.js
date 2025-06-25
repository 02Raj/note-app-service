const express = require("express");
const router = express.Router();
const planController = require("../controllers/plan.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/generate", authMiddleware, planController.generateSmartPlan);
router.patch("/:id/mark", authMiddleware, planController.markPlanStatus);
router.get("/", authMiddleware, planController.getPlans);
router.get("/progress", authMiddleware, planController.getPlanProgress);

module.exports = router;
