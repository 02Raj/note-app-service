const mockInterviewService = require('../services/mockInterview.service.js');

// Naya interview shuru karne ke liye
exports.startInterview = async (req, res) => {
  try {
    // userId ko aap protect middleware se req.user.id se lenge
    // Abhi ke liye hum ise body se le rahe hain
    const { userId, jobProfile, experience, topics } = req.body;

    if (!userId || !jobProfile || !experience) {
      return res.status(400).json({ message: "userId, jobProfile, and experience are required." });
    }

    const interviewSession = await mockInterviewService.createInterviewSession({ userId, jobProfile, experience, topics });
    res.status(201).json(interviewSession);
  } catch (error) {
    console.error("Error starting interview:", error);
    res.status(500).json({ message: "Failed to start interview session.", error: error.message });
  }
};

// Jawaab submit karne ke liye
exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId, questionNumber, userAnswer } = req.body;
     if (!sessionId || !questionNumber || !userAnswer) {
      return res.status(400).json({ message: "sessionId, questionNumber, and userAnswer are required." });
    }

    const nextQuestion = await mockInterviewService.submitAnswerAndUpdate({ sessionId, questionNumber, userAnswer });
    
    if (nextQuestion.interviewComplete) {
        res.status(200).json({ message: "Interview completed successfully!", interviewComplete: true });
    } else {
        res.status(200).json(nextQuestion);
    }

  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ message: "Failed to submit answer.", error: error.message });
  }
};

// Results paane ke liye
exports.getResults = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const results = await mockInterviewService.getFeedbackReport(sessionId);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ message: "Failed to fetch results.", error: error.message });
  }
};