const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const dsaController = require("../controllers/dsa.controller");

const router = express.Router();

router.use(authMiddleware);

router.post("/problems", dsaController.createProblem);
router.get("/problems", dsaController.getProblems);
router.get("/problems/:id", dsaController.getProblem);
router.put("/problems/:id", dsaController.updateProblem);
router.delete("/problems/:id", dsaController.deleteProblem);

router.post("/problems/:id/revise", dsaController.reviseProblem);
router.get("/due-today", dsaController.getDueToday);
router.get("/patterns", dsaController.getPatterns);
router.get("/dashboard", dsaController.getDashboard);
router.post("/analyze", dsaController.analyze);

module.exports = router;
