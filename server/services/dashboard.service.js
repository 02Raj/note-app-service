

const Topic = require("../models/topic.model");
const Note = require("../models/note.model");
const Deadline = require("../models/deadline.model");

/**
 * Fetches all statistics for the user's dashboard.
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const getDashboardStats = async (userId) => {
  // We will use Promise.all so that all database queries run in parallel.
  // This is much faster than awaiting them one by one.
  const [
    totalTopics,
    completedTopics,
    totalNotes,
    notesDueForRevision,
    upcomingDeadlines
  ] = await Promise.all([
    // 1. Count of total topics
    Topic.countDocuments({ createdBy: userId }),
    // 2. Count of completed topics (assuming the Topic model has a 'status' field)
    Topic.countDocuments({ createdBy: userId, status: 'Completed' }),
    // 3. Count of total notes
    Note.countDocuments({ createdBy: userId }),
    // 4. Count of notes due for revision (from the previous feature)
    Note.countDocuments({ createdBy: userId, revisionDueDate: { $lte: new Date() } }),
    // 5. Count of upcoming deadlines (assuming the Deadline model has a 'status' field)
    Deadline.countDocuments({ createdBy: userId, date: { $gte: new Date() }, status: 'Pending' })
  ]);

  // Return all stats in a single object
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
    }
  };
};

module.exports = {
  getDashboardStats,
};