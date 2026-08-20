const mongoose = require("mongoose");
const DsaProblem = require("../models/dsaProblem.model");
const { analyzeDsaSolution } = require("./dsaGemini.service");

const REVISION_GAPS = {
  1: [1, 3, 7, 14],
  2: [3, 7, 14, 30],
  3: [7, 14, 21, 60],
  4: [14, 30, 60, 120],
};

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const addDays = (date, days) => new Date(startOfDay(date).getTime() + days * DAY_MS);

const getGapForStage = (confidence, stage) => {
  const gaps = REVISION_GAPS[confidence] || REVISION_GAPS[3];
  const index = Math.min(Math.max(stage, 0), gaps.length - 1);
  return gaps[index];
};

const getRevisionScheduleDates = (solvedAt, confidence) => {
  const base = startOfDay(solvedAt);
  const gaps = REVISION_GAPS[confidence] || REVISION_GAPS[3];
  return gaps.map((gap) => addDays(base, gap));
};

const buildFilters = (userId, query = {}) => {
  const filters = { userId };

  if (query.pattern) {
    filters.pattern = query.pattern;
  }

  if (query.status) {
    filters.status = query.status;
  }

  if (query.difficulty) {
    filters.difficulty = query.difficulty;
  }

  return filters;
};

const createProblem = async (userId, data) => {
  const solvedAt = data.solvedAt ? new Date(data.solvedAt) : new Date();
  const confidence = Number(data.confidence || 3);

  const firstGap = getGapForStage(confidence, 0);
  const nextRevisionDate = addDays(solvedAt, firstGap);

  const payload = {
    userId,
    title: data.title,
    leetcodeNumber: data.leetcodeNumber ? Number(data.leetcodeNumber) : null,
    leetcodeUrl: data.leetcodeUrl,
    difficulty: data.difficulty || "Medium",
    problemStatement: data.problemStatement || "",
    exampleInput: data.exampleInput || "",
    exampleOutput: data.exampleOutput || "",
    pattern: data.pattern,
    subPattern: data.subPattern || "",
    triggerSentence: data.triggerSentence || "",
    approachUsed: data.approachUsed || "",
    keyInsight: data.keyInsight || "",
    bruteForce: data.bruteForce || "",
    whyOptimal: data.whyOptimal || "",
    weakPoint: data.weakPoint || "",
    revisionNote: data.revisionNote || "",
    commonMistakes: Array.isArray(data.commonMistakes) ? data.commonMistakes : [],
    code: data.code || "",
    language: data.language || "",
    timeComplexity: data.timeComplexity || "",
    spaceComplexity: data.spaceComplexity || "",
    solvedAt,
    confidence,
    revisionStage: 0,
    nextRevisionDate,
    lastRevisedAt: null,
    status: data.status || "active",
    similarProblems: Array.isArray(data.similarProblems) ? data.similarProblems : [],
    revisionHistory: [],
  };

  const problem = await DsaProblem.create(payload);

  return {
    problem,
    revisionSchedule: getRevisionScheduleDates(solvedAt, confidence),
  };
};

const listProblems = async (userId, query = {}) => {
  const filters = buildFilters(userId, query);
  return DsaProblem.find(filters).sort({ createdAt: -1 });
};

const getProblemById = async (userId, id) => {
  return DsaProblem.findOne({ _id: id, userId });
};

const updateProblem = async (userId, id, updateData) => {
  const allowedFields = [
    "title",
    "leetcodeNumber",
    "leetcodeUrl",
    "difficulty",
    "problemStatement",
    "exampleInput",
    "exampleOutput",
    "pattern",
    "subPattern",
    "triggerSentence",
    "approachUsed",
    "keyInsight",
    "bruteForce",
    "whyOptimal",
    "weakPoint",
    "revisionNote",
    "commonMistakes",
    "code",
    "language",
    "timeComplexity",
    "spaceComplexity",
    "status",
    "similarProblems",
    "solvedAt",
    "lastRevisedAt",
    "nextRevisionDate",
  ];

  const payload = {};

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(updateData, field)) {
      payload[field] = updateData[field];
    }
  });

  if (Object.prototype.hasOwnProperty.call(updateData, "confidence")) {
    payload.confidence = Number(updateData.confidence);
    const current = await DsaProblem.findOne({ _id: id, userId }).select(
      "revisionStage solvedAt"
    );

    if (!current) return null;

    const stage = current.revisionStage || 0;
    payload.nextRevisionDate = addDays(
      current.solvedAt || new Date(),
      getGapForStage(payload.confidence, stage)
    );
  }

  return DsaProblem.findOneAndUpdate({ _id: id, userId }, { $set: payload }, { new: true });
};

const deleteProblem = async (userId, id) => {
  return DsaProblem.findOneAndDelete({ _id: id, userId });
};

const reviseProblem = async (userId, id, confidenceInput) => {
  const confidence = Number(confidenceInput);
  if (![1, 2, 3, 4].includes(confidence)) {
    throw new Error("Confidence must be between 1 and 4");
  }

  const problem = await DsaProblem.findOne({ _id: id, userId });
  if (!problem) return null;

  const now = new Date();
  const previousConfidence = problem.confidence || confidence;
  let nextStage = problem.revisionStage || 0;

  if (confidence < previousConfidence) {
    nextStage = 0;
  } else if (confidence <= 2) {
    nextStage = Math.max(0, nextStage);
  } else {
    nextStage = Math.min(4, nextStage + 1);
  }

  const nextGap = getGapForStage(confidence, nextStage);
  problem.confidence = confidence;
  problem.revisionStage = nextStage;
  problem.lastRevisedAt = now;
  problem.nextRevisionDate = addDays(now, nextGap);

  if (nextStage >= 4 && confidence >= 4) {
    problem.status = "mastered";
  } else if (problem.status === "mastered" && confidence <= 2) {
    problem.status = "active";
  }

  problem.revisionHistory.push({
    revisedAt: now,
    confidence,
    revisionStage: nextStage,
  });

  await problem.save();

  return {
    problem,
    revisionSchedule: getRevisionScheduleDates(problem.solvedAt || new Date(), confidence),
  };
};

const getDueTodayProblems = async (userId) => {
  return DsaProblem.find({
    userId,
    status: { $ne: "archived" },
    nextRevisionDate: { $lte: endOfDay(new Date()) },
  }).sort({ nextRevisionDate: 1 });
};

const getPatternStats = async (userId) => {
  const stats = await DsaProblem.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: { $ne: "archived" },
      },
    },
    {
      $group: {
        _id: "$pattern",
        solved: { $sum: 1 },
        avgConfidence: { $avg: "$confidence" },
      },
    },
    {
      $project: {
        _id: 0,
        pattern: "$_id",
        solved: 1,
        avgConfidence: { $round: ["$avgConfidence", 2] },
      },
    },
    { $sort: { solved: -1 } },
  ]);

  return stats.map((item) => ({
    ...item,
    mastery:
      item.avgConfidence >= 3.5
        ? "Strong"
        : item.avgConfidence >= 2.5
        ? "Moderate"
        : "Weak",
  }));
};

const getDashboard = async (userId) => {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const sevenDaysAgo = addDays(todayStart, -6);

  const [
    dueToday,
    patternMastery,
    totalSolved,
    totalMastered,
    allRevisions,
    todayDoneCount,
    weeklyActivity,
  ] = await Promise.all([
    getDueTodayProblems(userId),
    getPatternStats(userId),
    DsaProblem.countDocuments({ userId }),
    DsaProblem.countDocuments({ userId, status: "mastered" }),
    DsaProblem.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$revisionHistory" },
      { $project: { revisedAt: "$revisionHistory.revisedAt" } },
      { $sort: { revisedAt: 1 } },
    ]),
    DsaProblem.countDocuments({
      userId,
      lastRevisedAt: { $gte: todayStart, $lte: todayEnd },
    }),
    DsaProblem.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$revisionHistory" },
      {
        $match: {
          "revisionHistory.revisedAt": {
            $gte: sevenDaysAgo,
            $lte: todayEnd,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$revisionHistory.revisedAt",
            },
          },
          revisions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const revisedDaySet = new Set(
    allRevisions.map((entry) => startOfDay(entry.revisedAt).toISOString())
  );

  let currentStreak = 0;
  let cursor = startOfDay(new Date());

  while (revisedDaySet.has(cursor.toISOString())) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  let longestStreak = 0;
  let running = 0;
  let prevDate = null;

  allRevisions.forEach((entry) => {
    const day = startOfDay(entry.revisedAt);
    if (!prevDate) {
      running = 1;
    } else {
      const diff = Math.round((day - prevDate) / DAY_MS);
      running = diff === 1 ? running + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, running);
    prevDate = day;
  });

  return {
    streak: {
      current: currentStreak,
      longest: longestStreak,
      todayDone: todayDoneCount > 0,
    },
    dueToday,
    patternMastery,
    totalSolved,
    totalMastered,
    weeklyActivity,
  };
};

const analyzeProblemWithAI = async (userId, payload) => {
  if (!payload.problemName || !payload.code) {
    throw new Error("problemName and code are required");
  }

  const analysis = await analyzeDsaSolution({
    problemName: payload.problemName,
    leetcodeUrl: payload.leetcodeUrl,
    language: payload.language || "",
    code: payload.code,
    felt: payload.felt || "",
    confidence: Number(payload.confidence || 3),
  });

  return {
    userId,
    ...analysis,
  };
};

const detectLanguage = (code) => {
  if (code.includes("function") || code.includes("const") || code.includes("let")) return "JavaScript";
  if (code.includes("def ") || code.includes("import ")) return "Python";
  if (code.includes("public class") || code.includes("System.out")) return "Java";
  if (code.includes("#include") || code.includes("std::")) return "C++";
  return "JavaScript";
};

const slugify = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

const quickAddProblem = async (userId, payload) => {
  const { leetcodeNumber, title, pattern, code } = payload;

  // 1. Build LeetCode URL from number and title
  const slug = slugify(title);
  const leetcodeUrl = `https://leetcode.com/problems/${slug}/`;

  // 2. Detect language from code
  const language = detectLanguage(code);

  // 3. Analyze with AI
  const analysis = await analyzeDsaSolution({
    problemName: title,
    leetcodeUrl,
    language,
    code,
    felt: "",
    confidence: 3,
  });

  // 4. Create problem with AI data + user inputs
  return await createProblem(userId, {
    leetcodeNumber: Number(leetcodeNumber),
    title,
    leetcodeUrl,
    pattern,
    code,
    language,
    ...analysis,
    confidence: analysis.confidence || 3,
  });
};

// One-shot: analyze with AI and immediately save to DB
const analyzeAndSave = async (userId, payload) => {
  if (!payload.title || !payload.code) {
    throw new Error("title and code are required");
  }

  const confidence = Number(payload.confidence || 3);

  const analysis = await analyzeDsaSolution({
    problemName: payload.title,
    leetcodeUrl: payload.leetcodeUrl,
    language: payload.language || "Java",
    code: payload.code,
    felt: payload.felt || "",
    confidence,
  });

  // Merge AI output with user-provided data (user fields take priority)
  const mergedData = {
    ...analysis,
    ...payload,
    confidence,
  };

  const result = await createProblem(userId, mergedData);

  return {
    problem: result.problem,
    revisionSchedule: result.revisionSchedule,
    aiAnalysis: analysis,
  };
};

const manualAddProblem = async (userId, payload) => {
  const { 
    title, 
    pattern, 
    difficulty, 
    approachUsed, 
    timeComplexity, 
    spaceComplexity, 
    keyInsight, 
    lastRevisionDate, 
    language, 
    code 
  } = payload;

  // Create problem with manual data only (no AI)
  const problemPayload = {
    title,
    pattern,
    difficulty,
    approachUsed: approachUsed || "",
    timeComplexity: timeComplexity || "",
    spaceComplexity: spaceComplexity || "",
    keyInsight: keyInsight || "",
    code,
    language: language || "Java",
    confidence: 3, // Default confidence
    subPattern: "",
    triggerSentence: "",
    bruteForce: "",
    whyOptimal: "",
    weakPoint: "",
    revisionNote: "",
    commonMistakes: [],
    similarProblems: [],
    leetcodeUrl: "",
    leetcodeNumber: null,
  };

  // Handle last revision date if provided
  if (lastRevisionDate) {
    problemPayload.lastRevisedAt = new Date(lastRevisionDate);
  }

  return await createProblem(userId, problemPayload);
};

module.exports = {
  REVISION_GAPS,
  getRevisionScheduleDates,
  createProblem,
  listProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
  reviseProblem,
  getDueTodayProblems,
  getPatternStats,
  getDashboard,
  analyzeProblemWithAI,
  analyzeAndSave,
  quickAddProblem,
  manualAddProblem,
};
