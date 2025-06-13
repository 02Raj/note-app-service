const MockInterview = require('../models/mockInterview.model.js');
const { geminiService } = require('./gemini.service.js');

/**
 * Creates a new mock interview session.
 */
exports.createInterviewSession = async ({ userId, jobProfile, experience, topics }) => {
  const prompt = `You are an expert technical interviewer. Generate 10 interview questions for a candidate applying for the role of a '${jobProfile}' with '${experience}' of experience. Focus on these topics: '${topics.join(', ')}'. Include a mix of behavioral, technical, and problem-solving questions. Return the response as a JSON array of strings. Example: ["Question 1", "Question 2"]`;

  const questionsText = await geminiService.generateJson(prompt);
  const questions = questionsText.map(q => ({ questionText: q, userAnswer: '' }));

  const newSession = new MockInterview({
    userId,
    jobProfile,
    experience,
    questions,
  });
  await newSession.save();

  return {
    sessionId: newSession._id,
    questionNumber: 1,
    questionText: newSession.questions[0].questionText,
    totalQuestions: newSession.questions.length
  };
};

/**
 * Submits a user's answer and gets the next question.
 */
exports.submitAnswerAndUpdate = async ({ sessionId, questionNumber, userAnswer }) => {
  const session = await MockInterview.findById(sessionId);
  if (!session) throw new Error("Interview session not found.");

  session.questions[questionNumber - 1].userAnswer = userAnswer;
  await session.save();

  if (questionNumber >= session.questions.length) {
    session.status = 'Completed';
    await session.save();
    return { interviewComplete: true };
  } else {
    return {
      sessionId: session._id,
      questionNumber: questionNumber + 1,
      questionText: session.questions[questionNumber].questionText,
      totalQuestions: session.questions.length,
      interviewComplete: false
    };
  }
};

/**
 * Generates and retrieves the feedback report for a completed interview.
 */
exports.getFeedbackReport = async (sessionId) => {
  const session = await MockInterview.findById(sessionId);
  if (!session) throw new Error("Interview session not found.");
  if (session.status !== 'Completed') throw new Error("Interview is not yet completed.");
  
  // Return saved data if it already exists
  if (session.feedback && session.feedback.overallSummary && session.score > 0) {
      return session;
  }

  // Clean HTML tags from user answers before sending to the AI
  const transcriptForAI = session.questions.map(q => ({
    question: q.questionText,
    answer: q.userAnswer ? q.userAnswer.replace(/<[^>]*>/g, '') : ''
  }));

  const transcript = JSON.stringify(transcriptForAI);

  // --- NEW, ROBUST APPROACH ---

  // Prompt 1: Get only the detailed, per-question analysis from the AI.
  const detailedFeedbackPrompt = `You are an expert interview coach for a '${session.jobProfile}' role. For the provided transcript, return a JSON array where each object corresponds to a question. Each object must contain ONLY these keys: 'strengths' (array of strings), 'areasForImprovement' (array of strings), 'suggestedAnswer' (string), and a 'score' (number out of 10). Do NOT include the original question or user answer in your response. The transcript is: ${transcript}`;

  // Prompt 2: Get only the overall summary.
  const summaryPrompt = `Based on the following interview transcript, provide a concise overall summary of the candidate's performance. Return a JSON object with a single key "overallSummary". The transcript is: ${transcript}`;

  try {
    // Run both AI requests in parallel for efficiency
    const [detailedAnalysis, summaryData] = await Promise.all([
      geminiService.generateJson(detailedFeedbackPrompt), // Returns an array of analysis objects
      geminiService.generateJson(summaryPrompt)      // Returns { overallSummary: "..." }
    ]);

    // Combine the original Q&A with the AI's analysis for a complete result
    const detailedFeedback = session.questions.map((q, index) => {
      const analysis = detailedAnalysis[index] || {}; // Use a fallback for safety
      return {
        questionText: q.questionText,
        userAnswer: q.userAnswer,
        strengths: analysis.strengths || [],
        areasForImprovement: analysis.areasForImprovement || [],
        suggestedAnswer: analysis.suggestedAnswer || "N/A",
        score: analysis.score || 0
      };
    });

    // Calculate the average score from the detailed feedback
    let averageScore = 0;
    if (detailedFeedback.length > 0) {
      const totalScore = detailedFeedback.reduce((sum, item) => sum + item.score, 0);
      averageScore = totalScore / detailedFeedback.length;
    }

    // Save the complete, assembled data to the session
    session.feedback = {
      overallSummary: summaryData.overallSummary || "No summary was provided.",
      detailedFeedback: detailedFeedback
    };
    session.score = averageScore;
    await session.save();

    return session;

  } catch (error) {
    console.error("Error during feedback and score generation:", error);
    throw new Error("Failed to generate feedback from the AI service.");
  }
};
