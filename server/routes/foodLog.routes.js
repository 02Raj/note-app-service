const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const foodLogController = require("../controllers/foodLog.controller");

const router = express.Router();

router.use(authMiddleware);

router.post("/", foodLogController.createFoodEntry);
router.get("/", foodLogController.getFoodEntries);
router.get("/summary", foodLogController.getNutritionSummary);
router.get("/report", foodLogController.getNutritionReport);
router.get("/insight", foodLogController.getNutritionInsight);

module.exports = router;
