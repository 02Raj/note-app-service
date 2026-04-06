const { DailyLog, TaskTemplate } = require("../models/dailytask.model");
const { getGeminiInsight } = require("./dailyRoutineGemini.service");

const getTodayStr = () => new Date().toISOString().split("T")[0];
const getDateStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
};

// ─────────────────────────────────────────────────────────────
// PROBLEM 1 SOLVER: "Raat ko realize hota hai sab pending hai"
// SOLUTION: EOD Summary — din khatam hone se pehle reality check
// ─────────────────────────────────────────────────────────────

/**
 * EOD (End of Day) Summary
 * Call this at any time — best at evening
 * Shows: what's done, what's pending, your score, honest message
 */
const getEODSummary = async (userId) => {
  const today = getTodayStr();
  const log = await DailyLog.findOne({ user: userId, date: today });

  if (!log) {
    return {
      date: today,
      message: "Aaj ka log abhi bana nahi — GET /today call karo pehle",
      score: 0,
      completed: [],
      pending: [],
      eodGrade: "F",
    };
  }

  const completed = log.tasks.filter((t) => t.isCompleted);
  const pending = log.tasks.filter((t) => !t.isCompleted);
  const highPriorityPending = pending.filter((t) => t.priority === "high");

  // Score calculation — high priority tasks worth more
  const totalWeight = log.tasks.reduce((sum, t) => {
    return sum + (t.priority === "high" ? 3 : t.priority === "medium" ? 2 : 1);
  }, 0);
  const completedWeight = completed.reduce((sum, t) => {
    return sum + (t.priority === "high" ? 3 : t.priority === "medium" ? 2 : 1);
  }, 0);
  const weightedScore = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

  // Grade based on weighted score
  const eodGrade =
    weightedScore >= 90 ? "S" :
    weightedScore >= 75 ? "A" :
    weightedScore >= 55 ? "B" :
    weightedScore >= 35 ? "C" : "D";

  // Honest message based on reality
  let honestMessage = "";
  if (highPriorityPending.length > 0 && weightedScore < 50) {
    honestMessage = `Bhai, ${highPriorityPending.map(t => t.title).join(", ")} — ye HIGH priority tasks aaj bhi pending hain. Kal ke liye ye pehle karo.`;
  } else if (weightedScore >= 75) {
    honestMessage = "Solid din tha! High priority tasks pe focus tha — isi consistency se placement milegi.";
  } else if (weightedScore >= 50) {
    honestMessage = "Theek din tha, but high priority tasks mein thodi aur attention chahiye thi.";
  } else {
    honestMessage = "Aaj ka din weak raha. Koi judgement nahi — kal subah PEHLE ek high priority task khatam karo, phir kuch aur dekho.";
  }

  return {
    date: today,
    eodGrade,
    weightedScore,
    rawCompletionRate: log.stats.completionRate,
    totalTasks: log.stats.total,
    completedCount: completed.length,
    pendingCount: pending.length,
    highPriorityPending: highPriorityPending.map((t) => t.title),
    completed: completed.map((t) => ({ title: t.title, priority: t.priority, category: t.category })),
    pending: pending.map((t) => ({ title: t.title, priority: t.priority, category: t.category })),
    honestMessage,
  };
};

// ─────────────────────────────────────────────────────────────
// PROBLEM 2 SOLVER: "Kuch din productive kuch din zero"
// SOLUTION: Streak Guard + Weekly Pattern Analysis
// ─────────────────────────────────────────────────────────────

/**
 * Weekly Pattern — kis din productive hai, kis din nahi
 * Finds your best day, worst day, and warns before streak breaks
 */
const getWeeklyPattern = async (userId) => {
  const logs = await DailyLog.find({ user: userId })
    .sort({ date: -1 })
    .limit(28) // 4 weeks
    .select("date stats");

  if (logs.length === 0) return { message: "Abhi koi history nahi hai" };

  // Day-of-week analysis (0=Sun, 1=Mon...6=Sat)
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayStats = {};
  dayNames.forEach((d) => { dayStats[d] = { total: 0, count: 0 }; });

  logs.forEach((log) => {
    const dayName = dayNames[new Date(log.date).getDay()];
    dayStats[dayName].total += log.stats.completionRate;
    dayStats[dayName].count += 1;
  });

  const dayAverages = Object.entries(dayStats)
    .filter(([, v]) => v.count > 0)
    .map(([day, v]) => ({
      day,
      avgCompletion: Math.round(v.total / v.count),
      sampleSize: v.count,
    }))
    .sort((a, b) => b.avgCompletion - a.avgCompletion);

  const bestDay = dayAverages[0];
  const worstDay = dayAverages[dayAverages.length - 1];

  // Streak guard — warn if today's completion is low (streak at risk)
  const today = getTodayStr();
  const todayLog = await DailyLog.findOne({ user: userId, date: today }).select("stats");
  const streakAtRisk = todayLog && todayLog.stats.completionRate < 30;

  // Consistency score — how many days had >50% completion
  const goodDays = logs.filter((l) => l.stats.completionRate >= 50).length;
  const consistencyScore = Math.round((goodDays / logs.length) * 100);

  // Pattern insight
  let patternInsight = "";
  if (worstDay.avgCompletion < 30) {
    patternInsight = `${worstDay.day} tera sabse kamzor din hai (avg ${worstDay.avgCompletion}%). Is din ke liye zyada tasks mat rakho — 2-3 focused tasks zyada effective honge.`;
  }
  if (bestDay.avgCompletion > 70) {
    patternInsight += ` ${bestDay.day} tera strongest day hai (avg ${bestDay.avgCompletion}%) — DSA ya koi bada topic is din schedule karo.`;
  }

  return {
    consistencyScore,
    goodDaysOutOf: logs.length,
    bestDay,
    worstDay,
    allDays: dayAverages,
    streakAtRisk,
    streakWarning: streakAtRisk
      ? "Aaj ka din abhi bhi weak hai — streak tutne wala hai. Abhi ek bhi task complete karo."
      : null,
    patternInsight,
  };
};

// ─────────────────────────────────────────────────────────────
// PROBLEM 3 SOLVER: "Ek kaam shuru kiya beech mein chhod deta hun"
// SOLUTION: Focus Mode — ek task lock karo, baaki blur
// ─────────────────────────────────────────────────────────────

/**
 * Focus Mode — "Abhi sirf YE ek kaam"
 * Returns the single most important incomplete task right now
 * Based on: priority + category rotation (DSA > SpringBoot > etc.)
 * Also returns a "next up" so brain already knows what comes after
 */
const getFocusTask = async (userId) => {
  const today = getTodayStr();
  const log = await DailyLog.findOne({ user: userId, date: today });

  if (!log) return { message: "GET /today call karo pehle" };

  const pending = log.tasks
    .map((t, index) => ({ ...t.toObject(), index }))
    .filter((t) => !t.isCompleted);

  if (pending.length === 0) {
    return {
      allDone: true,
      message: "Aaj ke saare tasks complete! Rest karo ya kal ke liye plan banao.",
    };
  }

  // Priority order: high > medium > low
  // Within same priority: skill > discipline > habit > custom
  const categoryOrder = { skill: 0, discipline: 1, habit: 2, custom: 3 };
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const sorted = [...pending].sort((a, b) => {
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return (categoryOrder[a.category] || 3) - (categoryOrder[b.category] || 3);
  });

  const focusTask = sorted[0];
  const nextTask = sorted[1] || null;

  // Suggest time block based on category
  const timeBlock = {
    skill: "25-min Pomodoro — phone door rakho",
    habit: "Bas 10 minute — start karo, momentum aayega",
    discipline: "Set a 1hr timer — screen time track karo",
    custom: "30 min block — distractions band karo",
  }[focusTask.category] || "25-min focused block";

  return {
    allDone: false,
    focusTask: {
      index: focusTask.index,
      title: focusTask.title,
      category: focusTask.category,
      priority: focusTask.priority,
      color: focusTask.color,
    },
    nextTask: nextTask
      ? { title: nextTask.title, category: nextTask.category }
      : null,
    suggestion: `Abhi sirf "${focusTask.title}" — ${timeBlock}. Baaki sab baad mein.`,
    pendingCount: pending.length,
  };
};

// ─────────────────────────────────────────────────────────────
// GOAL TRACKER: "Job milni hai" — placement readiness
// SOLUTION: Job Readiness Score based on actual task completion
// ─────────────────────────────────────────────────────────────

/**
 * Job Readiness Score — placement ke liye kitna ready hai
 * Tracks: DSA consistency + Spring Boot progress + Portfolio work + System Design
 * Based on last 14 days of task completion data
 */
const getJobReadinessScore = async (userId) => {
  const logs = await DailyLog.find({ user: userId })
    .sort({ date: -1 })
    .limit(14)
    .select("date tasks stats");

  if (logs.length === 0) {
    return { message: "14 din ka data chahiye accurate score ke liye" };
  }

  // Keywords to match tasks to job-relevant skills
  const skillKeywords = {
    dsa: ["dsa", "data structure", "algorithm", "leetcode", "coding", "array", "tree", "graph", "dp"],
    springboot: ["spring", "springboot", "spring boot", "java", "microservice", "rest api", "hibernate"],
    systemdesign: ["system design", "lld", "hld", "design", "architecture", "database design"],
    portfolio: ["portfolio", "project", "demo", "freelance", "github", "readme"],
  };

  const scores = { dsa: 0, springboot: 0, systemdesign: 0, portfolio: 0 };
  const attempts = { dsa: 0, springboot: 0, systemdesign: 0, portfolio: 0 };

  logs.forEach((log) => {
    log.tasks.forEach((task) => {
      const titleLower = task.title.toLowerCase();
      Object.entries(skillKeywords).forEach(([skill, keywords]) => {
        if (keywords.some((kw) => titleLower.includes(kw))) {
          attempts[skill]++;
          if (task.isCompleted) scores[skill]++;
        }
      });
    });
  });

  // Calculate % for each skill (0 attempts = 0 score)
  const skillScores = {};
  const skillStatus = {};
  Object.keys(scores).forEach((skill) => {
    const pct = attempts[skill] > 0
      ? Math.round((scores[skill] / attempts[skill]) * 100)
      : 0;
    skillScores[skill] = pct;

    skillStatus[skill] =
      attempts[skill] === 0 ? "not_started" :
      pct >= 70 ? "strong" :
      pct >= 40 ? "needs_work" : "critical";
  });

  // Overall job readiness (DSA weighted most for placements)
  const weights = { dsa: 0.4, springboot: 0.3, systemdesign: 0.2, portfolio: 0.1 };
  const overallScore = Math.round(
    Object.entries(skillScores).reduce((sum, [skill, score]) => {
      return sum + score * weights[skill];
    }, 0)
  );

  // What to focus on RIGHT NOW for placement
  const criticalSkills = Object.entries(skillStatus)
    .filter(([, status]) => status === "critical" || status === "not_started")
    .map(([skill]) => skill);

  const focusRecommendation =
    criticalSkills.length > 0
      ? `Teri placement ke liye SABSE PEHLE: ${criticalSkills.join(" aur ")} — ye critical hai`
      : overallScore >= 70
      ? "Strong position hai! Mock interviews shuru karo aur apply karna start karo."
      : "Consistent reh — 70+ score aane tak apply mat karo, preparation first.";

  return {
    overallReadinessScore: overallScore,
    readinessLevel:
      overallScore >= 80 ? "Ready to apply" :
      overallScore >= 60 ? "Almost ready" :
      overallScore >= 40 ? "In progress" : "Early stage",
    skillBreakdown: {
      dsa: { score: skillScores.dsa, status: skillStatus.dsa, attempts: attempts.dsa, weight: "40% of score" },
      springboot: { score: skillScores.springboot, status: skillStatus.springboot, attempts: attempts.springboot, weight: "30% of score" },
      systemdesign: { score: skillScores.systemdesign, status: skillStatus.systemdesign, attempts: attempts.systemdesign, weight: "20% of score" },
      portfolio: { score: skillScores.portfolio, status: skillStatus.portfolio, attempts: attempts.portfolio, weight: "10% of score" },
    },
    dataBasedOn: `Last ${logs.length} days`,
    focusRecommendation,
    warningIfAny:
      attempts.dsa === 0
        ? "DSA ka koi task track nahi mila — 'DSA' word apne task titles mein use karo"
        : null,
  };
};

// ─────────────────────────────────────────────────────────────
// MASTER DASHBOARD — ek call mein sab kuch
// ─────────────────────────────────────────────────────────────

/**
 * Full Dashboard — single API call
 * Returns everything needed to render the complete dashboard
 */
const getDashboard = async (userId) => {
  const [eod, weekly, focus, jobReadiness] = await Promise.all([
    getEODSummary(userId),
    getWeeklyPattern(userId),
    getFocusTask(userId),
    getJobReadinessScore(userId),
  ]);

  // Current streak
  const logs = await DailyLog.find({ user: userId })
    .sort({ date: -1 })
    .limit(30)
    .select("date stats");

  let streak = 0;
  let prevDate = null;
  for (const log of logs) {
    const logDate = new Date(log.date);
    if (prevDate) {
      const diff = (prevDate - logDate) / (1000 * 60 * 60 * 24);
      if (diff > 1) break;
    }
    if (log.stats.completed > 0) { streak++; prevDate = logDate; }
    else break;
  }

  return {
    generatedAt: new Date().toISOString(),
    streak,
    todaySummary: eod,
    focusRightNow: focus,         // "Abhi ye ek kaam karo"
    weeklyPattern: weekly,        // "Tera best/worst day"
    jobReadiness,                 // "Placement ke liye kitna ready"
  };
};

module.exports = {
  getDashboard,
  getEODSummary,
  getWeeklyPattern,
  getFocusTask,
  getJobReadinessScore,
};