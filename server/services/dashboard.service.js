const mongoose = require('mongoose');
const Topic = require("../models/topic.model");
const Note = require("../models/note.model");
const Deadline = require("../models/deadline.model");
const MockInterview = require("../models/mockInterview.model");
const Progress = require("../models/progress.model");
const Session = require("../models/session.model"); // Import the new Session model

/**
 * Fetches all statistics for the user's dashboard.
 * @param {string} userId
 * @returns {Promise<Object>}
 */
const getDashboardStats = async (userId) => {
  // Running all database queries in parallel for better performance
  const [
    totalTopics,
    completedTopics,
    totalNotes,
    notesDueForRevision,
    upcomingDeadlines,
    missedDeadlines,
    completedDeadlines,
    totalMockInterviews,
    mockInterviewResults,
    recentScores,
    topProgressingTopics,
    totalSessionTime,
    // NEW: Add a query to get learning time per day for the last 7 days
    learningTimeByDay
  ] = await Promise.all([
    Topic.countDocuments({ createdBy: userId }),
    Topic.countDocuments({ createdBy: userId, status: 'Completed' }),
    Note.countDocuments({ createdBy: userId }),
    Note.countDocuments({ createdBy: userId, revisionDueDate: { $lte: new Date() } }),
    Deadline.countDocuments({ userId: userId, status: 'pending' }),
    Deadline.countDocuments({ userId: userId, status: 'missed' }),
    Deadline.countDocuments({ userId: userId, status: 'completed' }),
    MockInterview.countDocuments({ userId: userId }),
    MockInterview.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, averageScore: { $avg: "$score" } } }
    ]),
    MockInterview.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(7)
      .select('score createdAt'),
    Progress.find({ updatedBy: userId })
      .sort({ progressPercent: -1 })
      .limit(5)
      .populate('topicId', 'name')
      .select('topicId progressPercent'),
    Session.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), duration: { $ne: null } } },
        { $group: { _id: null, totalMinutes: { $sum: "$duration" } } }
    ]),
    // NEW QUERY: Calculate learning time per day for the last week
    Session.aggregate([
        { $match: { 
            userId: new mongoose.Types.ObjectId(userId),
            // Filter sessions that started in the last 7 days
            startTime: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
        }},
        { $group: {
            // Group by the day of the week (1=Sun, 2=Mon, ..., 7=Sat)
            _id: { $dayOfWeek: "$startTime" },
            totalMinutes: { $sum: "$duration" }
        }},
        { $sort: { _id: 1 } }
    ])
  ]);

  const avgResult = mockInterviewResults[0];
  const averageScore = (avgResult && avgResult.averageScore != null) ? avgResult.averageScore : 0;

  // Process total time spent
  const totalMinutes = totalSessionTime[0]?.totalMinutes || 0;
  const timeSpent = {
      hours: Math.floor(totalMinutes / 60),
      minutes: Math.round(totalMinutes % 60)
  };

  // NEW: Process learning time for the bar chart
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyMinutes = Array(7).fill(0);
  learningTimeByDay.forEach(day => {
      // MongoDB dayOfWeek is 1-7 (Sun-Sat), array index is 0-6
      if (day._id >= 1 && day._id <= 7) {
          weeklyMinutes[day._id - 1] = Math.round(day.totalMinutes);
      }
  });

  const learningTimeChartData = {
      series: [{
          name: 'Minutes Spent',
          data: weeklyMinutes
      }],
      categories: daysOfWeek
  };

  // Return all stats in a single, well-structured object
  return {
    topics: {
      total: totalTopics,
      completed: completedTopics,
    },
    notes: {
      total: totalNotes,
      dueForRevision: notesDueForRevision,
    },
    deadlines: {
      upcoming: upcomingDeadlines,
      missed: missedDeadlines,
      completed: completedDeadlines,
    },
    mockInterviews: {
      total: totalMockInterviews,
      averageScore: averageScore.toFixed(2),
      recentScores: recentScores.reverse()
    },
    topProgressingTopics: topProgressingTopics.map(p => ({
        name: p.topicId ? p.topicId.name : 'Unknown Topic',
        progress: p.progressPercent
    })),
    timeSpent: timeSpent,
    // NEW: Add the chart data to the response
    learningTimeChart: learningTimeChartData
  };
};

module.exports = {
  getDashboardStats,
};
