const Expense = require("../models/expense.model");
const { getExpenseInsightFromGemini } = require("./expenseGemini.service");

const toDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getWeekRange = (referenceDate = new Date()) => {
  const ref = startOfDay(referenceDate);
  const day = ref.getDay();
  const diffToMonday = (day + 6) % 7;

  const start = new Date(ref);
  start.setDate(ref.getDate() - diffToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return { start: startOfDay(start), end: endOfDay(end) };
};

const getMonthRange = (referenceDate = new Date()) => {
  const ref = startOfDay(referenceDate);
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  return { start: startOfDay(start), end: endOfDay(end) };
};

const parseRange = ({ period = "weekly", date = new Date() }) => {
  const parsedDate = toDate(date) || new Date();

  if (period === "monthly") {
    return getMonthRange(parsedDate);
  }

  return getWeekRange(parsedDate);
};

const buildSummary = async (userId, start, end) => {
  const match = {
    userId,
    date: { $gte: start, $lte: end },
  };

  const expenses = await Expense.find(match).sort({ date: -1 });

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const expenseCount = expenses.length;
  const highestExpense = expenseCount > 0 ? Math.max(...expenses.map((e) => e.amount)) : 0;

  const dayCount = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
  const averagePerDay = Number((totalSpent / dayCount).toFixed(2));

  const categoryAggregation = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const dailyTrendAggregation = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" },
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const byCategory = categoryAggregation.map((item) => ({
    category: item._id,
    total: Number(item.total.toFixed(2)),
    count: item.count,
  }));

  const dailyTrend = dailyTrendAggregation.map((item) => ({
    date: item._id,
    total: Number(item.total.toFixed(2)),
  }));

  const topExpenses = expenses.slice(0, 5).map((item) => ({
    title: item.title,
    amount: item.amount,
    category: item.category,
    date: item.date,
  }));

  return {
    period: {
      start,
      end,
    },
    summary: {
      totalSpent: Number(totalSpent.toFixed(2)),
      expenseCount,
      averagePerDay,
      highestExpense,
    },
    byCategory,
    dailyTrend,
    topExpenses,
    expenses,
  };
};

const addExpense = async (userId, payload) => {
  const { title, amount, category, note, paymentMethod, date } = payload;

  if (!title || amount === undefined || amount === null) {
    throw new Error("title and amount are required");
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error("amount must be a positive number");
  }

  const parsedDate = date ? toDate(date) : new Date();
  if (!parsedDate) {
    throw new Error("Invalid date format");
  }

  const expense = await Expense.create({
    userId,
    title,
    amount: Number(parsedAmount.toFixed(2)),
    category: category || "other",
    note: note || "",
    paymentMethod: paymentMethod || "upi",
    date: parsedDate,
  });

  return expense;
};

const getExpenses = async (userId, query = {}) => {
  const {
    from,
    to,
    category,
    paymentMethod,
    page = 1,
    limit = 20,
  } = query;

  const match = { userId };

  if (from || to) {
    match.date = {};
    if (from) {
      const fromDate = toDate(from);
      if (!fromDate) {
        throw new Error("Invalid from date");
      }
      match.date.$gte = startOfDay(fromDate);
    }

    if (to) {
      const toDateValue = toDate(to);
      if (!toDateValue) {
        throw new Error("Invalid to date");
      }
      match.date.$lte = endOfDay(toDateValue);
    }
  }

  if (category) {
    match.category = category;
  }

  if (paymentMethod) {
    match.paymentMethod = paymentMethod;
  }

  const parsedPage = Math.max(1, Number(page) || 1);
  const parsedLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const [items, total] = await Promise.all([
    Expense.find(match).sort({ date: -1, createdAt: -1 }).skip(skip).limit(parsedLimit),
    Expense.countDocuments(match),
  ]);

  return {
    items,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit) || 1,
    },
  };
};

const getSummary = async (userId, options = {}) => {
  const { period = "weekly", date = new Date() } = options;
  const { start, end } = parseRange({ period, date });

  const data = await buildSummary(userId, start, end);

  return {
    period,
    start,
    end,
    summary: data.summary,
    byCategory: data.byCategory,
  };
};

const getReport = async (userId) => {
  const now = new Date();
  const weeklyRange = getWeekRange(now);
  const monthlyRange = getMonthRange(now);

  const [weekly, monthly] = await Promise.all([
    buildSummary(userId, weeklyRange.start, weeklyRange.end),
    buildSummary(userId, monthlyRange.start, monthlyRange.end),
  ]);

  return {
    weekly: {
      start: weeklyRange.start,
      end: weeklyRange.end,
      ...weekly.summary,
      byCategory: weekly.byCategory,
    },
    monthly: {
      start: monthlyRange.start,
      end: monthlyRange.end,
      ...monthly.summary,
      byCategory: monthly.byCategory,
    },
    topExpensesThisMonth: monthly.topExpenses,
    dailyTrendThisMonth: monthly.dailyTrend,
  };
};

const getInsight = async (userId, options = {}) => {
  const { period = "monthly", date = new Date() } = options;
  const { start, end } = parseRange({ period, date });

  const data = await buildSummary(userId, start, end);

  if (data.summary.expenseCount === 0) {
    return {
      period,
      start,
      end,
      summary: data.summary,
      insight: {
        overallSummary: "Is period me aapne koi expense entry nahi ki.",
        topLeakages: [],
        savingsSuggestions: [
          "Daily end par minimum 1 baar expense log update karo.",
          "Chhote spends bhi add karo taaki realistic report aaye.",
        ],
        nextWeekBudgetPlan: {
          recommendedBudget: 0,
          categoryCaps: [],
        },
        riskAlert: "No spending data available.",
      },
    };
  }

  const insight = await getExpenseInsightFromGemini({
    periodLabel: `${period} (${start.toISOString().slice(0, 10)} to ${end
      .toISOString()
      .slice(0, 10)})`,
    summary: data.summary,
    topExpenses: data.topExpenses,
    byCategory: data.byCategory,
    dailyTrend: data.dailyTrend,
  });

  return {
    period,
    start,
    end,
    summary: data.summary,
    byCategory: data.byCategory,
    topExpenses: data.topExpenses,
    insight,
  };
};

module.exports = {
  addExpense,
  getExpenses,
  getSummary,
  getReport,
  getInsight,
};
