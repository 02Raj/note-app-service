const expenseService = require("../services/expense.service");
const { successResponse, errorResponse } = require("../utils/responseHelper");

const createExpense = async (req, res) => {
  try {
    const expense = await expenseService.addExpense(req.userId, req.body);
    return successResponse(res, expense, "Expense added successfully", 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const listExpenses = async (req, res) => {
  try {
    const data = await expenseService.getExpenses(req.userId, req.query);
    return successResponse(res, data, "Expenses fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getExpenseSummary = async (req, res) => {
  try {
    const data = await expenseService.getSummary(req.userId, req.query);
    return successResponse(res, data, "Expense summary fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getExpenseReport = async (req, res) => {
  try {
    const data = await expenseService.getReport(req.userId);
    return successResponse(res, data, "Expense report fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getExpenseInsight = async (req, res) => {
  try {
    const data = await expenseService.getInsight(req.userId, req.query);
    return successResponse(res, data, "Expense AI insight generated successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createExpense,
  listExpenses,
  getExpenseSummary,
  getExpenseReport,
  getExpenseInsight,
};
