const mockInterviewService = require('../services/mockInterview.service.js');

exports.startInterview = async (req, res) => {
  try {
    const { userId, jobProfile, experience, topics, questionCount, timeLimit, customQuestions } = req.body;
    if (!userId || !jobProfile || !experience || !topics) {
      return res.status(400).json({ message: "userId, jobProfile, experience, topics required." });
    }
    const session = await mockInterviewService.createInterviewSession({
      userId,
      jobProfile,
      experience,
      topics,
      questionCount,
      timeLimit,
      customQuestions
    });
    res.status(201).json(session);
  } catch (error) {
    console.error("Error starting interview:", error);
    res.status(500).json({ message: "Interview session start failed.", error: error.message });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId, questionNumber, userAnswer, source, elapsedTime, notes } = req.body;
    if (!sessionId || !questionNumber || userAnswer == undefined) {
      return res.status(400).json({ message: "sessionId, questionNumber, userAnswer required." });
    }
    const next = await mockInterviewService.submitAnswerAndUpdate({
      sessionId,
      questionNumber,
      userAnswer,
      source: source || 'manual',
      elapsedTime,
      notes
    });
    res.status(200).json(next);
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ message: "Failed to submit answer.", error: error.message });
  }
};

exports.getResults = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const results = await mockInterviewService.getFeedbackReport(sessionId);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ message: "Failed to fetch interview results.", error: error.message });
  }
};

exports.pauseInterview = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const result = await mockInterviewService.pauseInterview({ sessionId });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to pause interview.", error: error.message });
  }
};

exports.resumeInterview = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const result = await mockInterviewService.resumeInterview({ sessionId });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to resume interview.", error: error.message });
  }
};

exports.getInterviewHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await mockInterviewService.getUserInterviewHistory(userId);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch interview history.", error: error.message });
  }
};
