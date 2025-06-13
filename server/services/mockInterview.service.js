const MockInterview = require('../models/mockInterview.model.js');
const { geminiService } = require('./gemini.service.js');

/**
 * Creates a new mock interview session.
 * Generates questions using the AI service and saves them.
 */
exports.createInterviewSession = async ({ userId, jobProfile, experience, topics }) => {
  const prompt = `You are an expert technical interviewer. Generate 2 interview questions for a candidate applying for the role of a '${jobProfile}' with '${experience}' of experience. Focus on these topics: '${topics.join(', ')}'. Include a mix of behavioral, technical, and problem-solving questions. Return the response as a JSON array of strings. Example: ["Question 1", "Question 2"]`;

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
 * Submits a user's answer and gets the next question, or marks the interview as complete.
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
 * This function gets a score for each question and calculates the overall average.
 */
exports.getFeedbackReport = async (sessionId) => {
  const session = await MockInterview.findById(sessionId);
  if (!session) throw new Error("Interview session not found.");
  if (session.status !== 'Completed') throw new Error("Interview is not yet completed.");
  
  // If feedback and a score already exist, return the saved data to avoid extra API calls.
  if (session.feedback && session.feedback.overallSummary && session.score > 0) {
      return session;
  }

  // Clean the user's answers by removing HTML tags before sending to the AI.
  const transcriptForAI = session.questions.map(q => {
    const cleanAnswer = q.userAnswer ? q.userAnswer.replace(/<[^>]*>/g, '') : '';
    return {
      question: q.questionText,
      answer: cleanAnswer
    };
  });

  const transcript = JSON.stringify(transcriptForAI);

  // A single, comprehensive prompt to get all feedback and per-question scores in one API call.
  const feedbackPrompt = `You are an expert interview coach for a '${session.jobProfile}' role. Analyze the following interview transcript. Provide a detailed analysis in a structured JSON format. The JSON should have two keys: 
  1. 'overallSummary': A string summarizing the candidate's performance.
  2. 'detailedFeedback': An array of objects. Each object must contain 'questionText', 'userAnswer', 'strengths', 'areasForImprovement', 'suggestedAnswer', and a 'score' out of 10 for that specific question.
  The transcript is: ${transcript}`;

  try {
    // Call the AI service once to get the complete feedback structure.
    const feedbackData = await geminiService.generateJson(feedbackPrompt);

    // Calculate the average score from the scores given for each question.
    let totalScore = 0;
    let averageScore = 0;
    if (feedbackData.detailedFeedback && feedbackData.detailedFeedback.length > 0) {
      totalScore = feedbackData.detailedFeedback.reduce((sum, item) => sum + (item.score || 0), 0);
      averageScore = totalScore / feedbackData.detailedFeedback.length;
    }

    // Save the feedback and the calculated average score to the database.
    session.feedback = feedbackData;
    session.score = averageScore; // This is the overall average score.
    await session.save();

    return session;

  } catch (error) {
    console.error("Error during feedback and score generation:", error);
    throw new Error("Failed to generate feedback from the AI service.");
  }
};
