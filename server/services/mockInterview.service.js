const MockInterview = require('../models/mockInterview.model.js');
const { geminiService } = require('./gemini.service.js'); // you need to provide this or stub it

exports.createInterviewSession = async ({
  userId,
  jobProfile,
 experience,
  topics,
  questionCount = 10,
  timeLimit = 0,
  customQuestions = []
}) => {
  let questionsArr = [];
  if (customQuestions.length > 0) {
    questionsArr = customQuestions.slice(0, questionCount).map(q => ({
      questionText: q,
      answer: { text: '', source: 'manual' }
    }));
  } else {
    const prompt = `You are an expert technical interviewer. Generate ${questionCount} interview questions for a candidate applying for '${jobProfile}' with '${experience}' experience. Focus on: '${topics.join(', ')}'. Include mix of behavioral, technical and problem-solving questions. Return JSON array of strings.`;
    const questionsText = await geminiService.generateJson(prompt);
    questionsArr = questionsText.map(q => ({
      questionText: q,
      answer: { text: '', source: 'manual' }
    }));
  }

  const newSession = new MockInterview({
    userId,
    jobProfile,
    experience,
    topics,
    questionCount: questionsArr.length,
    timeLimit,
    customQuestions,
    questions: questionsArr,
    status: 'InProgress',
  });
  await newSession.save();

  return {
    sessionId: newSession._id,
    questionNumber: 1,
    questionText: newSession.questions[0].questionText,
    totalQuestions: newSession.questions.length,
    timeLimit: newSession.timeLimit,
    customQuestions: newSession.customQuestions,
    status: newSession.status
  };
};

exports.submitAnswerAndUpdate = async ({
  sessionId,
  questionNumber,
  userAnswer,
  source = 'manual',
  elapsedTime = 0,
  notes = ''
}) => {
  const session = await MockInterview.findById(sessionId);
  if (!session) throw new Error("Interview session not found.");

  const qIndex = questionNumber - 1;
  session.questions[qIndex].answer = { text: userAnswer, source };
  session.questions[qIndex].notes = notes;
  session.questions[qIndex].elapsedTime = elapsedTime;

  let interviewComplete = false;
  if (questionNumber >= session.questions.length) {
    session.status = 'Completed';
    session.finishedAt = new Date();
    interviewComplete = true;
  }
  await session.save();

  if (interviewComplete) return { interviewComplete: true };
  return {
    sessionId: session._id,
    questionNumber: questionNumber + 1,
    questionText: session.questions[questionNumber].questionText,
    totalQuestions: session.questions.length,
    status: session.status,
    interviewComplete: false
  };
};

exports.getFeedbackReport = async (sessionId) => {
  const session = await MockInterview.findById(sessionId);
  if (!session) throw new Error("Interview session not found.");
  if (session.status !== 'Completed') throw new Error("Interview is not yet completed.");
  if (session.feedback && session.feedback.overallSummary && session.score > 0) return session;

  const transcriptForAI = session.questions.map(q => ({
    question: q.questionText,
    answer: (q.answer.source === 'manual') ? (q.answer.text || '') : '',
    skipEvaluation: q.answer.source === 'ai'
  }));

  const filteredTranscript = JSON.stringify(transcriptForAI);

  const detailedFeedbackPrompt =
    `You are an expert interview coach for a '${session.jobProfile}' role.
    For the provided transcript, return a JSON array for each question.
    If skipEvaluation is true or answer is empty, set score:0, strengths:[], areasForImprovement:[], suggestedAnswer:"Answer was AI generated or not provided".
    For normal answers, return strengths, areasForImprovement, suggestedAnswer, score (0-10).
    Transcript: ${filteredTranscript}`;

  const summaryPrompt =
    `Based on the following interview transcript, provide a concise overall summary of the candidate's performance. Only consider answers which are NOT AI generated or blank. Return: { "overallSummary": "..." } Transcript: ${filteredTranscript}`;

  try {
    const [detailedAnalysis, summaryData] = await Promise.all([
      geminiService.generateJson(detailedFeedbackPrompt),
      geminiService.generateJson(summaryPrompt)
    ]);

    const detailedFeedback = session.questions.map((q, idx) => {
      const analysis = detailedAnalysis[idx] || {};
      return {
        questionText: q.questionText,
        userAnswer: q.answer.text,
        answerSource: q.answer.source,
        strengths: analysis.strengths || [],
        areasForImprovement: analysis.areasForImprovement || [],
        suggestedAnswer: analysis.suggestedAnswer || "N/A",
        score: analysis.score || 0,
        notes: q.notes || "",
        elapsedTime: q.elapsedTime || 0
      };
    });

    let validScores = detailedFeedback.filter(x => x.answerSource === 'manual').map(x => x.score);
    let averageScore = validScores.length ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;

    session.feedback = {
      overallSummary: summaryData.overallSummary || "No summary.",
      detailedFeedback
    };
    session.score = averageScore;
    await session.save();

    return session;
  } catch (error) {
    console.error("Error during feedback and score generation:", error);
    throw new Error("Failed to generate feedback from AI service.");
  }
};

exports.pauseInterview = async ({ sessionId }) => {
  const session = await MockInterview.findById(sessionId);
  if (!session) throw new Error("Interview session not found.");
  if (session.status !== 'InProgress') throw new Error("Can only pause InProgress interview.");

  session.status = 'Paused';
  session.pausedAt = new Date();
  await session.save();
  return { sessionId, status: 'Paused', pausedAt: session.pausedAt };
};

exports.resumeInterview = async ({ sessionId }) => {
  const session = await MockInterview.findById(sessionId);
  if (!session) throw new Error("Interview session not found.");
  if (session.status !== 'Paused') throw new Error("Can only resume Paused interview.");

  session.status = 'InProgress';
  session.pausedAt = undefined;
  await session.save();
  return { sessionId, status: 'InProgress' };
};

exports.getUserInterviewHistory = async (userId) => {
  return await MockInterview.find({ userId }).sort({ createdAt: -1 });
};
