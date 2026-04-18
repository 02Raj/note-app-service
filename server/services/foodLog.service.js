const FoodEntry = require("../models/foodEntry.model");
const { DailyLog } = require("../models/dailytask.model");
const {
  estimateNutritionFromText,
  generateNutritionInsight,
} = require("./nutritionGemini.service");

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
  if (period === "daily") {
    return { start: startOfDay(parsedDate), end: endOfDay(parsedDate) };
  }
  return getWeekRange(parsedDate);
};

const toNum = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildNutritionSummary = async (userId, start, end) => {
  const match = { userId, date: { $gte: start, $lte: end } };
  const entries = await FoodEntry.find(match).sort({ date: -1, createdAt: -1 });

  const totals = entries.reduce(
    (acc, item) => {
      acc.calories += toNum(item.calories);
      acc.protein += toNum(item.protein);
      acc.carbs += toNum(item.carbs);
      acc.fat += toNum(item.fat);
      acc.fiber += toNum(item.fiber);
      acc.sugar += toNum(item.sugar);
      acc.sodium += toNum(item.sodium);
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
  );

  const mealCounts = entries.reduce(
    (acc, item) => {
      acc[item.mealType] = (acc[item.mealType] || 0) + 1;
      return acc;
    },
    { breakfast: 0, lunch: 0, dinner: 0, snack: 0, drink: 0, other: 0 }
  );

  const daysSpan = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  const averages = {
    calories: Number((totals.calories / daysSpan).toFixed(2)),
    protein: Number((totals.protein / daysSpan).toFixed(2)),
    carbs: Number((totals.carbs / daysSpan).toFixed(2)),
    fat: Number((totals.fat / daysSpan).toFixed(2)),
  };

  const byFood = await FoodEntry.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$foodName",
        calories: { $sum: "$calories" },
        count: { $sum: 1 },
      },
    },
    { $sort: { calories: -1 } },
    { $limit: 10 },
  ]);

  const dailyNutrition = await FoodEntry.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        calories: { $sum: "$calories" },
        protein: { $sum: "$protein" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    range: { start, end },
    totals: {
      calories: Number(totals.calories.toFixed(2)),
      protein: Number(totals.protein.toFixed(2)),
      carbs: Number(totals.carbs.toFixed(2)),
      fat: Number(totals.fat.toFixed(2)),
      fiber: Number(totals.fiber.toFixed(2)),
      sugar: Number(totals.sugar.toFixed(2)),
      sodium: Number(totals.sodium.toFixed(2)),
    },
    averages,
    mealCounts,
    entriesCount: entries.length,
    topFoods: byFood.map((x) => ({
      foodName: x._id,
      calories: Number((x.calories || 0).toFixed(2)),
      count: x.count,
    })),
    dailyNutrition: dailyNutrition.map((x) => ({
      date: x._id,
      calories: Number((x.calories || 0).toFixed(2)),
      protein: Number((x.protein || 0).toFixed(2)),
    })),
    entries,
  };
};

const buildMealConsistency = (dailyNutrition, entries) => {
  const dayMealMap = {};

  entries.forEach((item) => {
    const day = new Date(item.date).toISOString().slice(0, 10);
    if (!dayMealMap[day]) {
      dayMealMap[day] = new Set();
    }
    dayMealMap[day].add(item.mealType);
  });

  const perDay = Object.entries(dayMealMap).map(([date, mealSet]) => ({
    date,
    mealsLogged: mealSet.size,
    hasBreakfast: mealSet.has("breakfast"),
    hasLunch: mealSet.has("lunch"),
    hasDinner: mealSet.has("dinner"),
  }));

  const daysTracked = dailyNutrition.length;
  const breakfastMissDays = perDay.filter((d) => !d.hasBreakfast).length;
  const mealCompleteDays = perDay.filter(
    (d) => d.hasBreakfast && d.hasLunch && d.hasDinner
  ).length;

  return {
    daysTracked,
    breakfastMissDays,
    mealCompleteDays,
    consistencyRate:
      daysTracked > 0 ? Number(((mealCompleteDays / daysTracked) * 100).toFixed(2)) : 0,
    perDay,
  };
};

const buildRoutineSignals = async (userId, start, end) => {
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  const logs = await DailyLog.find({
    user: userId,
    date: { $gte: startStr, $lte: endStr },
  }).select("date stats");

  if (!logs.length) {
    return {
      days: 0,
      averageTaskCompletionRate: 0,
      highConsistencyDays: 0,
    };
  }

  const avg =
    logs.reduce((sum, l) => sum + (l?.stats?.completionRate || 0), 0) / logs.length;

  const highConsistencyDays = logs.filter((l) => (l?.stats?.completionRate || 0) >= 70).length;

  return {
    days: logs.length,
    averageTaskCompletionRate: Number(avg.toFixed(2)),
    highConsistencyDays,
  };
};

const addFoodEntry = async (userId, payload) => {
  const {
    mealType,
    foodName,
    quantity = 1,
    unit = "serving",
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    sodium,
    note = "",
    date,
  } = payload;

  if (!mealType || !foodName) {
    throw new Error("mealType and foodName are required");
  }

  const parsedDate = date ? toDate(date) : new Date();
  if (!parsedDate) {
    throw new Error("Invalid date");
  }

  const hasManualNutrition =
    [calories, protein, carbs, fat, fiber, sugar, sodium].some((v) => v !== undefined);

  let nutrition = {
    calories: toNum(calories),
    protein: toNum(protein),
    carbs: toNum(carbs),
    fat: toNum(fat),
    fiber: toNum(fiber),
    sugar: toNum(sugar),
    sodium: toNum(sodium),
    isEstimatedByAI: false,
  };

  if (!hasManualNutrition) {
    const estimate = await estimateNutritionFromText({
      foodName,
      quantity: toNum(quantity) || 1,
      unit,
      mealType,
    });

    nutrition = {
      calories: estimate.calories,
      protein: estimate.protein,
      carbs: estimate.carbs,
      fat: estimate.fat,
      fiber: estimate.fiber,
      sugar: estimate.sugar,
      sodium: estimate.sodium,
      isEstimatedByAI: true,
    };
  }

  const doc = await FoodEntry.create({
    userId,
    date: parsedDate,
    mealType,
    foodName,
    quantity: toNum(quantity) || 1,
    unit,
    ...nutrition,
    note,
  });

  return doc;
};

const listFoodEntries = async (userId, query = {}) => {
  const { from, to, mealType, page = 1, limit = 20 } = query;
  const match = { userId };

  if (from || to) {
    match.date = {};
    if (from) {
      const d = toDate(from);
      if (!d) throw new Error("Invalid from date");
      match.date.$gte = startOfDay(d);
    }
    if (to) {
      const d = toDate(to);
      if (!d) throw new Error("Invalid to date");
      match.date.$lte = endOfDay(d);
    }
  }

  if (mealType) {
    match.mealType = mealType;
  }

  const parsedPage = Math.max(1, Number(page) || 1);
  const parsedLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const [items, total] = await Promise.all([
    FoodEntry.find(match).sort({ date: -1, createdAt: -1 }).skip(skip).limit(parsedLimit),
    FoodEntry.countDocuments(match),
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

const getNutritionSummary = async (userId, options = {}) => {
  const { period = "daily", date = new Date() } = options;
  const { start, end } = parseRange({ period, date });

  const data = await buildNutritionSummary(userId, start, end);

  return {
    period,
    start,
    end,
    totals: data.totals,
    averages: data.averages,
    mealCounts: data.mealCounts,
    entriesCount: data.entriesCount,
  };
};

const getNutritionReport = async (userId) => {
  const now = new Date();
  const dailyRange = { start: startOfDay(now), end: endOfDay(now) };
  const weeklyRange = getWeekRange(now);
  const monthlyRange = getMonthRange(now);

  const [daily, weekly, monthly] = await Promise.all([
    buildNutritionSummary(userId, dailyRange.start, dailyRange.end),
    buildNutritionSummary(userId, weeklyRange.start, weeklyRange.end),
    buildNutritionSummary(userId, monthlyRange.start, monthlyRange.end),
  ]);

  return {
    daily: {
      start: dailyRange.start,
      end: dailyRange.end,
      ...daily.totals,
      mealCounts: daily.mealCounts,
      entriesCount: daily.entriesCount,
    },
    weekly: {
      start: weeklyRange.start,
      end: weeklyRange.end,
      ...weekly.totals,
      averages: weekly.averages,
      mealCounts: weekly.mealCounts,
      entriesCount: weekly.entriesCount,
    },
    monthly: {
      start: monthlyRange.start,
      end: monthlyRange.end,
      ...monthly.totals,
      averages: monthly.averages,
      mealCounts: monthly.mealCounts,
      entriesCount: monthly.entriesCount,
    },
    topFoodsThisMonth: monthly.topFoods,
    dailyNutritionTrendThisMonth: monthly.dailyNutrition,
  };
};

const getNutritionInsight = async (userId, options = {}) => {
  const { period = "weekly", date = new Date() } = options;
  const { start, end } = parseRange({ period, date });

  const data = await buildNutritionSummary(userId, start, end);
  const mealConsistency = buildMealConsistency(data.dailyNutrition, data.entries);
  const routineSignals = await buildRoutineSignals(userId, start, end);

  if (!data.entriesCount) {
    return {
      period,
      start,
      end,
      totals: data.totals,
      insight: {
        overallAssessment: "Is period me food logs available nahi hain.",
        calorieStatus: "balanced",
        proteinStatus: "adequate",
        mealConsistencyFeedback: "Pehle daily meal log consistency build karo.",
        healthImpactRisks: [],
        dailyRoutineImpact: "No meal data to evaluate routine impact.",
        actionPlan: [
          "Har meal ke baad quick entry karo.",
          "Breakfast/lunch/dinner tino log karo.",
          "Agar exact nutrition na pata ho to food name likho, AI estimate karega.",
        ],
        recommendedTargets: {
          dailyCalories: 0,
          dailyProtein: 0,
          dailyWaterLiters: 3,
        },
      },
    };
  }

  const insight = await generateNutritionInsight({
    periodLabel: `${period} (${start.toISOString().slice(0, 10)} to ${end
      .toISOString()
      .slice(0, 10)})`,
    nutritionSummary: {
      totals: data.totals,
      averages: data.averages,
      entriesCount: data.entriesCount,
    },
    mealConsistency,
    topFoods: data.topFoods,
    routineSignals,
  });

  return {
    period,
    start,
    end,
    totals: data.totals,
    averages: data.averages,
    mealConsistency,
    topFoods: data.topFoods,
    routineSignals,
    insight,
  };
};

module.exports = {
  addFoodEntry,
  listFoodEntries,
  getNutritionSummary,
  getNutritionReport,
  getNutritionInsight,
};
