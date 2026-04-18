const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const expenseController = require("../controllers/expense.controller");

const router = express.Router();

router.use(authMiddleware);

router.post("/", expenseController.createExpense);
router.get("/", expenseController.listExpenses);
router.get("/summary", expenseController.getExpenseSummary);
router.get("/report", expenseController.getExpenseReport);
router.get("/insight", expenseController.getExpenseInsight);

module.exports = router;
