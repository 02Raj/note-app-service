const mongoose = require("mongoose");
const InterviewPrepPlan = require("../models/interviewPrepPlan.model");
const Note = require("../models/note.model");
const NoteRevisionLog = require("../models/noteRevisionLog.model");
const DsaProblem = require("../models/dsaProblem.model");
const Session = require("../models/session.model");

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

const getOrCreateDefaultPlan = async (userId) => {
  let plan = await InterviewPrepPlan.findOne({ userId, isActive: true });
  if (plan) return plan;

  const defaultTargetDays = 90;
  plan = await InterviewPrepPlan.create({
    userId,
    startDate: new Date(),
    targetDate: addDays(new Date(), defaultTargetDays),
    targetDays: defaultTargetDays,
    isActive: true,
  });

  return plan;
};

const upsertPlan = async (userId, payload) => {
  const targetDays = Number(payload.targetDays);

  if (!Number.isFinite(targetDays) || targetDays < 7 || targetDays > 365) {
    throw new Error("targetDays must be between 7 and 365");
  }

  const startDate = payload.startDate ? new Date(payload.startDate) : new Date();
  if (Number.isNaN(startDate.getTime())) {
    throw new Error("Invalid startDate");
  }

  const targetDate = addDays(startDate, targetDays);

  return InterviewPrepPlan.findOneAndUpdate(
    { userId, isActive: true },
    {
      $set: {
        startDate,
        targetDate,
        targetDays,
        isActive: true,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
};

const getPlanSnapshot = (plan) => {
  const today = startOfDay(new Date());
  const startDate = startOfDay(plan.startDate);
  const targetDate = startOfDay(plan.targetDate);

  const elapsedRaw = Math.floor((today - startDate) / DAY_MS) + 1;
  const elapsedDays = Math.max(0, elapsedRaw);
  const remainingDays = Math.max(0, Math.ceil((targetDate - today) / DAY_MS));
  const progressPercent = plan.targetDays > 0
    ? Math.min(100, Math.max(0, Number(((elapsedDays / plan.targetDays) * 100).toFixed(2))))
    : 0;

  return {
    startDate,
    targetDate,
    targetDays: plan.targetDays,
    elapsedDays,
    remainingDays,
    progressPercent,
    isExpired: today > targetDate,
  };
};

const getStudyConsistency = async (userId, startDate) => {
  const sessions = await Session.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        startTime: { $gte: startOfDay(startDate) },
        duration: { $gt: 0 },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$startTime" },
        },
        totalMinutes: { $sum: "$duration" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const activeDays = sessions.length;
  const totalStudyMinutes = sessions.reduce((sum, day) => sum + (day.totalMinutes || 0), 0);

  const activeDaySet = new Set(sessions.map((entry) => entry._id));
  const today = startOfDay(new Date());
  let cursor = today;
  let currentStreak = 0;

  while (activeDaySet.has(cursor.toISOString().slice(0, 10))) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  let longestStreak = 0;
  let running = 0;
  let prevDate = null;

  sessions.forEach((entry) => {
    const currentDate = startOfDay(new Date(entry._id));
    if (!prevDate) {
      running = 1;
    } else {
      const gap = Math.round((currentDate - prevDate) / DAY_MS);
      running = gap === 1 ? running + 1 : 1;
    }

    longestStreak = Math.max(longestStreak, running);
    prevDate = currentDate;
  });

  return {
    activeDays,
    totalStudyMinutes,
    totalStudyHours: Number((totalStudyMinutes / 60).toFixed(2)),
    dailyBreakdown: sessions,
    currentStreak,
    longestStreak,
  };
};

const getNotesDashboard = async (userId, planSnapshot) => {
  const [
    totalNotes,
    interviewNotes,
    nonInterviewNotes,
    priorityBreakdown,
    revisedCounts,
    topRevised,
    pendingPriorities,
  ] = await Promise.all([
    Note.countDocuments({ createdBy: userId }),
    Note.countDocuments({ createdBy: userId, isInterviewRelevant: true }),
    Note.countDocuments({ createdBy: userId, isInterviewRelevant: false }),
    Note.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(userId),
          isInterviewRelevant: true,
        },
      },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]),
    Note.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(userId),
          isInterviewRelevant: true,
        },
      },
      {
        $group: {
          _id: null,
          totalRevisions: { $sum: "$revisionCount" },
          totalRevisionMinutes: { $sum: "$totalRevisionMinutes" },
        },
      },
    ]),
    Note.find({ createdBy: userId, isInterviewRelevant: true })
      .sort({ revisionCount: -1, updatedAt: -1 })
      .limit(8)
      .select("title priority revisionCount totalRevisionMinutes lastRevisedAt"),
    Note.find({
      createdBy: userId,
      isInterviewRelevant: true,
      priority: "low",
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("title priority createdAt"),
  ]);

  const priorityStats = { high: 0, medium: 0, low: 0 };
  priorityBreakdown.forEach((row) => {
    if (row._id && Object.prototype.hasOwnProperty.call(priorityStats, row._id)) {
      priorityStats[row._id] = row.count;
    }
  });

  const revisionMeta = revisedCounts[0] || { totalRevisions: 0, totalRevisionMinutes: 0 };
  const avgRevisionPerInterviewNote = interviewNotes
    ? Number((revisionMeta.totalRevisions / interviewNotes).toFixed(2))
    : 0;

  const interviewRatio = totalNotes
    ? Number(((interviewNotes / totalNotes) * 100).toFixed(2))
    : 0;

  return {
    planWindow: {
      startDate: planSnapshot.startDate,
      targetDate: planSnapshot.targetDate,
    },
    totals: {
      totalNotes,
      interviewNotes,
      nonInterviewNotes,
      interviewRatio,
    },
    priorities: priorityStats,
    revision: {
      totalRevisions: revisionMeta.totalRevisions,
      totalRevisionMinutes: revisionMeta.totalRevisionMinutes,
      avgRevisionPerInterviewNote,
    },
    topRevisedNotes: topRevised,
    lowPriorityInterviewNotes: pendingPriorities,
  };
};

const getRevisionDashboard = async (userId, planSnapshot) => {
  const now = new Date();
  const weekAgo = addDays(now, -6);

  const [
    dueCount,
    overdueCount,
    weakNotes,
    completedInPlan,
    recentLogs,
    weeklyTrend,
  ] = await Promise.all([
    Note.countDocuments({
      createdBy: userId,
      isInterviewRelevant: true,
      revisionDueDate: { $lte: now },
    }),
    Note.countDocuments({
      createdBy: userId,
      isInterviewRelevant: true,
      revisionDueDate: { $lte: endOfDay(addDays(now, -1)) },
    }),
    Note.find({
      createdBy: userId,
      isInterviewRelevant: true,
      skippedCount: { $gte: 2 },
    })
      .sort({ skippedCount: -1, revisionDueDate: 1 })
      .limit(10)
      .select("title skippedCount revisionDueDate revisionStage"),
    NoteRevisionLog.countDocuments({
      userId,
      revisedAt: { $gte: planSnapshot.startDate },
    }),
    NoteRevisionLog.find({ userId })
      .sort({ revisedAt: -1 })
      .limit(12)
      .populate("noteId", "title priority")
      .select("noteId rating durationMinutes revisedAt"),
    NoteRevisionLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          revisedAt: { $gte: startOfDay(weekAgo), $lte: endOfDay(now) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$revisedAt" },
          },
          revisions: { $sum: 1 },
          minutes: { $sum: "$durationMinutes" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    summary: {
      dueCount,
      overdueCount,
      weakNotesCount: weakNotes.length,
      completedInPlan,
    },
    weakNotes,
    recentRevisionLogs: recentLogs,
    weeklyTrend,
  };
};

const getDsaDashboard = async (userId, planSnapshot) => {
  const now = new Date();

  const [
    totalProblems,
    masteredProblems,
    dueProblems,
    solvedInPlan,
    recentProblems,
    weakPatterns,
    revisionsInPlan,
  ] = await Promise.all([
    DsaProblem.countDocuments({ userId, status: { $ne: "archived" } }),
    DsaProblem.countDocuments({ userId, status: "mastered" }),
    DsaProblem.countDocuments({
      userId,
      status: { $ne: "archived" },
      nextRevisionDate: { $lte: now },
    }),
    DsaProblem.countDocuments({
      userId,
      createdAt: { $gte: planSnapshot.startDate },
      status: { $ne: "archived" },
    }),
    DsaProblem.find({ userId, status: { $ne: "archived" } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title pattern difficulty confidence revisionStage nextRevisionDate"),
    DsaProblem.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: { $ne: "archived" },
        },
      },
      {
        $group: {
          _id: "$pattern",
          avgConfidence: { $avg: "$confidence" },
          problems: { $sum: 1 },
        },
      },
      { $sort: { avgConfidence: 1, problems: -1 } },
      { $limit: 8 },
      {
        $project: {
          _id: 0,
          pattern: "$_id",
          avgConfidence: { $round: ["$avgConfidence", 2] },
          problems: 1,
        },
      },
    ]),
    DsaProblem.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      { $unwind: "$revisionHistory" },
      {
        $match: {
          "revisionHistory.revisedAt": { $gte: planSnapshot.startDate },
        },
      },
      { $count: "count" },
    ]),
  ]);

  return {
    summary: {
      totalProblems,
      masteredProblems,
      dueProblems,
      solvedInPlan,
      revisionsInPlan: revisionsInPlan[0]?.count || 0,
    },
    weakPatterns,
    recentProblems,
  };
};

const getInterviewOverview = async (userId) => {
  const plan = await getOrCreateDefaultPlan(userId);
  const snapshot = getPlanSnapshot(plan);
  const consistency = await getStudyConsistency(userId, snapshot.startDate);

  const expectedActiveDays = Math.max(1, snapshot.elapsedDays);
  const consistencyPercent = Number(
    ((consistency.activeDays / expectedActiveDays) * 100).toFixed(2)
  );

  return {
    plan: snapshot,
    consistency: {
      ...consistency,
      consistencyPercent,
    },
  };
};

const getInterviewPrepSetupStatus = async (userId) => {
  const plan = await InterviewPrepPlan.findOne({ userId, isActive: true });
  if (!plan) {
    return {
      requiresSetup: true,
      plan: null,
    };
  }

  return {
    requiresSetup: false,
    plan: getPlanSnapshot(plan),
  };
};

module.exports = {
  upsertPlan,
  getInterviewOverview,
  getNotesDashboard,
  getRevisionDashboard,
  getDsaDashboard,
  getInterviewPrepSetupStatus,
  getOrCreateDefaultPlan,
  getPlanSnapshot,
};
