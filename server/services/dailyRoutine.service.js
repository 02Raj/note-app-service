const { TaskTemplate, DailyLog } = require("../models/dailytask.model");
const { getGeminiInsight } = require("./dailyRoutineGemini.service");

/**
 * Get today's date as "YYYY-MM-DD" string
 */
const getTodayStr = () => new Date().toISOString().split("T")[0];

/**
 * Get date string for N days offset
 */
const getDateStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
};

// ─────────────────────────────────────────────
// TASK TEMPLATES
// ─────────────────────────────────────────────

/**
 * Create a new task template (recurring or one-time)
 */
const createTemplate = async (userId, data) => {
  const template = await TaskTemplate.create({ user: userId, ...data });
  return template;
};

/**
 * Get all active templates for a user
 */
const getTemplates = async (userId) => {
  return TaskTemplate.find({ user: userId, isActive: true }).sort({
    priority: 1,
    createdAt: 1,
  });
};

/**
 * Update a template (e.g., change priority, toggle recurring)
 */
const updateTemplate = async (userId, templateId, data) => {
  return TaskTemplate.findOneAndUpdate(
    { _id: templateId, user: userId },
    { $set: data },
    { new: true }
  );
};

/**
 * Soft-delete a template (sets isActive: false)
 */
const deactivateTemplate = async (userId, templateId) => {
  return TaskTemplate.findOneAndUpdate(
    { _id: templateId, user: userId },
    { $set: { isActive: false } },
    { new: true }
  );
};

// ─────────────────────────────────────────────
// DAILY LOG
// ─────────────────────────────────────────────

/**
 * Get or auto-create today's daily log
 *
 * Logic:
 * 1. If log exists for today → return it
 * 2. If not → pull all active recurring templates → create log
 * 3. Also carry forward any incomplete CUSTOM (non-template) tasks from yesterday
 *    only if they were marked isRecurring when added
 */
const getTodayLog = async (userId) => {
  const today = getTodayStr();

  let log = await DailyLog.findOne({ user: userId, date: today });
  if (log) return log;

  // Build task list from recurring templates
  const templates = await TaskTemplate.find({
    user: userId,
    isActive: true,
    isRecurring: true,
  });

  const taskList = templates.map((t) => ({
    templateId: t._id,
    title: t.title,
    category: t.category,
    priority: t.priority,
    isRecurring: true,
    isCompleted: false,
    color: t.color,
  }));

  // Carry forward incomplete recurring custom tasks from yesterday
  const yesterday = getDateStr(-1);
  const yesterdayLog = await DailyLog.findOne({ user: userId, date: yesterday });
  if (yesterdayLog) {
    const carryForward = yesterdayLog.tasks.filter(
      (t) => !t.templateId && t.isRecurring && !t.isCompleted
    );
    carryForward.forEach((t) => {
      taskList.push({
        templateId: null,
        title: t.title,
        category: t.category,
        priority: t.priority,
        isRecurring: true,
        isCompleted: false,
        color: t.color,
      });
    });

    // Mark yesterday as next day planned
    yesterdayLog.nextDayPlanReady = true;
    await yesterdayLog.save();
  }

  log = await DailyLog.create({
    user: userId,
    date: today,
    tasks: taskList,
  });

  return log;
};

/**
 * Get log for a specific date (read-only history)
 */
const getLogByDate = async (userId, dateStr) => {
  return DailyLog.findOne({ user: userId, date: dateStr });
};

/**
 * Add a one-off custom task to today's log
 * If isRecurring=true → it also creates/updates the template
 */
const addCustomTask = async (userId, taskData) => {
  const today = getTodayStr();
  let log = await getTodayLog(userId);

  const newTask = {
    templateId: null,
    title: taskData.title,
    category: taskData.category || "custom",
    priority: taskData.priority || "medium",
    isRecurring: taskData.isRecurring || false,
    isCompleted: false,
    color: taskData.color || "#6366f1",
  };

  // If recurring → create a template so future days auto-include it
  if (taskData.isRecurring) {
    const template = await TaskTemplate.create({
      user: userId,
      title: taskData.title,
      category: taskData.category || "custom",
      priority: taskData.priority || "medium",
      isRecurring: true,
      color: taskData.color || "#6366f1",
    });
    newTask.templateId = template._id;
  }

  log.tasks.push(newTask);
  await log.save();
  return log;
};

/**
 * Toggle task completion (check/uncheck)
 */
const toggleTask = async (userId, date, taskIndex) => {
  const log = await DailyLog.findOne({ user: userId, date });
  if (!log) throw new Error("Log not found for this date");

  const task = log.tasks[taskIndex];
  if (!task) throw new Error("Task index out of range");

  task.isCompleted = !task.isCompleted;
  task.completedAt = task.isCompleted ? new Date() : null;

  await log.save(); // pre-save hook recalculates stats
  return log;
};

// ─────────────────────────────────────────────
// CONSISTENCY / STREAK
// ─────────────────────────────────────────────

/**
 * Get last N days of logs with stats (for streak/consistency view)
 */
const getRecentLogs = async (userId, days = 7) => {
  const logs = await DailyLog.find({ user: userId })
    .sort({ date: -1 })
    .limit(days)
    .select("date stats geminiInsight.thoughtOfTheDay nextDayPlanReady");
  return logs;
};

/**
 * Calculate current streak (consecutive days with ≥ 1 completed task)
 */
const getStreak = async (userId) => {
  const logs = await DailyLog.find({ user: userId })
    .sort({ date: -1 })
    .select("date stats");

  let streak = 0;
  let prevDate = null;

  for (const log of logs) {
    const logDate = new Date(log.date);

    if (prevDate) {
      const diff = (prevDate - logDate) / (1000 * 60 * 60 * 24);
      if (diff > 1) break; // gap in days → streak broken
    }

    if (log.stats.completed > 0) {
      streak++;
      prevDate = logDate;
    } else {
      break;
    }
  }

  return streak;
};

// ─────────────────────────────────────────────
// GEMINI INSIGHT
// ─────────────────────────────────────────────

/**
 * Generate and save Gemini insight for a given date's log
 * Uses last 7 days of logs for context
 */
const generateInsight = async (userId, date) => {
  const log = await DailyLog.findOne({ user: userId, date });
  if (!log) throw new Error("Log not found");

  const recentLogs = await DailyLog.find({ user: userId })
    .sort({ date: -1 })
    .limit(7)
    .select("date stats tasks");

  const streak = await getStreak(userId);

  const insight = await getGeminiInsight({ currentLog: log, recentLogs, streak });

  log.geminiInsight = { ...insight, generatedAt: new Date() };
  await log.save();

  return log;
};

module.exports = {
  createTemplate,
  getTemplates,
  updateTemplate,
  deactivateTemplate,
  getTodayLog,
  getLogByDate,
  addCustomTask,
  toggleTask,
  getRecentLogs,
  getStreak,
  generateInsight,
};