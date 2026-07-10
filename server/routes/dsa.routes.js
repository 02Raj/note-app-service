const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const dsaController = require("../controllers/dsa.controller");

const router = express.Router();

router.use(authMiddleware);

// CRUD
router.post("/problems", dsaController.createProblem);
router.get("/problems", dsaController.getProblems);
router.get("/problems/:id", dsaController.getProblem);
router.put("/problems/:id", dsaController.updateProblem);
router.delete("/problems/:id", dsaController.deleteProblem);

// Revision
router.post("/problems/:id/revise", dsaController.reviseProblem);
router.get("/due-today", dsaController.getDueToday);

// Stats & Dashboard
router.get("/patterns", dsaController.getPatterns);
router.get("/dashboard", dsaController.getDashboard);

// Search by LC number  e.g. GET /api/dsa/search?leetcodeNumber=167
router.get("/search", dsaController.searchByNumber);

// AI
router.post("/analyze", dsaController.analyze);            // analyze only — returns JSON, does NOT save
router.post("/analyze-and-save", dsaController.analyzeAndSave); // analyze + auto-save in one shot ✅

// Quick Add: Excel-like minimal input + AI automation 🚀
router.post("/quick-add", dsaController.quickAdd);

// Manual Add: Pure Excel-style manual entry (no AI) 📝
router.post("/manual-add", dsaController.manualAdd);

module.exports = router;
