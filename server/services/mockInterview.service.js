const MockInterview = require('../models/mockInterview.model.js');
const { geminiService } = require('./gemini.service.js'); // Hum gemini.service.js se function import karenge

// Naya interview session banane ke liye function
exports.createInterviewSession = async ({ userId, jobProfile, experience, topics }) => {
  const prompt = `You are an expert technical interviewer. Generate 2 interview questions for a candidate applying for the role of a '${jobProfile}' with '${experience}' of experience. Focus on these topics: '${topics.join(', ')}'. Include a mix of behavioral, technical, and problem-solving questions. Return the response as a JSON array of strings. Example: ["Question 1", "Question 2"]`;

  // Gemini se sawaal generate karwayenge
  const questionsText = await geminiService.generateJson(prompt);

  const questions = questionsText.map(q => ({ questionText: q, userAnswer: '' }));

  // DB mein naya session save karenge
  const newSession = new MockInterview({
    userId,
    jobProfile,
    experience,
    questions,
  });

  await newSession.save();
  
  // Frontend ko session ID aur pehla sawaal bhejenge
  return {
    sessionId: newSession._id,
    questionNumber: 1,
    questionText: newSession.questions[0].questionText,
    totalQuestions: newSession.questions.length
  };
};

// Jawaab submit karne aur agla sawaal paane ke liye function
exports.submitAnswerAndUpdate = async ({ sessionId, questionNumber, userAnswer }) => {
  const session = await MockInterview.findById(sessionId);
  if (!session) throw new Error("Interview session not found.");

  // User ka answer save karo
  session.questions[questionNumber - 1].userAnswer = userAnswer;
  await session.save();

  // Check karo ki interview poora ho gaya ya nahi
  if (questionNumber >= session.questions.length) {
    session.status = 'Completed';
    await session.save();
    return { interviewComplete: true };
  } else {
    // Agla sawaal bhejo
    return {
      sessionId: session._id,
      questionNumber: questionNumber + 1,
      questionText: session.questions[questionNumber].questionText,
      totalQuestions: session.questions.length,
      interviewComplete: false
    };
  }
};


// Feedback report generate karne ke liye function
exports.getFeedbackReport = async (sessionId) => {
  const session = await MockInterview.findById(sessionId);
  if (!session) throw new Error("Interview session not found.");
  if (session.status !== 'Completed') throw new Error("Interview is not yet completed.");

  // Agar feedback pehle se hai, to wahi bhej do
  if (session.feedback && session.feedback.overallSummary) {
      return session;
  }
  
  const transcript = JSON.stringify(session.questions.map(q => ({ question: q.questionText, answer: q.userAnswer })));

  const prompt = `You are a helpful and constructive interview coach. Analyze the following interview transcript for a '${session.jobProfile}' role. For each question and answer, provide strengths, areas for improvement, and a better, suggested answer. Finally, provide an overall summary. Return your analysis in a structured JSON format with a key 'overallSummary' (string) and 'detailedFeedback' (an array of objects, where each object has 'questionText', 'userAnswer', 'strengths', 'areasForImprovement', 'suggestedAnswer'). The transcript is: ${transcript}`;

  // Gemini se feedback generate karwayenge
  const feedbackData = await geminiService.generateJson(prompt);
  
  // Feedback ko DB mein save karenge
  session.feedback = feedbackData;
  await session.save();

  return session;
};