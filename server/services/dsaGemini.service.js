const { geminiService } = require("./gemini.service");

const buildDsaAnalysisPrompt = ({
  problemName,
  leetcodeUrl,
  language,
  code,
  felt,
  confidence,
}) => {
  return `
You are an expert DSA coach.
Analyze this solved problem and return ONLY strict JSON.

Required output shape:
{
  "pattern": "string",
  "subPattern": "string",
  "triggerSentence": "Main isko [PATTERN] isliye pehchanunga kyunki [signal]",
  "bruteForce": "string",
  "whyOptimal": "string",
  "weakPoint": "string",
  "revisionNote": "3-4 lines max. no code",
  "commonMistakes": ["string", "string", "string"],
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "similarProblems": [
    { "title": "string", "url": "string", "difficulty": "Easy|Medium|Hard", "whySimilar": "string" },
    { "title": "string", "url": "string", "difficulty": "Easy|Medium|Hard", "whySimilar": "string" },
    { "title": "string", "url": "string", "difficulty": "Easy|Medium|Hard", "whySimilar": "string" }
  ]
}

Rules:
- Keep each explanation short and practical.
- commonMistakes must have at least 3 points.
- similarProblems must have exactly 3 problems.
- difficulty values must be one of Easy, Medium, Hard.
- Never return markdown.

Problem Name: ${problemName}
LeetCode URL: ${leetcodeUrl}
Language: ${language}
How user felt: ${felt}
Confidence: ${confidence}

Code:
${code}
`.trim();
};

const analyzeDsaSolution = async (payload) => {
  const prompt = buildDsaAnalysisPrompt(payload);
  const result = await geminiService.generateJson(prompt);

  return {
    pattern: result.pattern || "",
    subPattern: result.subPattern || "",
    triggerSentence: result.triggerSentence || "",
    bruteForce: result.bruteForce || "",
    whyOptimal: result.whyOptimal || "",
    weakPoint: result.weakPoint || "",
    revisionNote: result.revisionNote || "",
    commonMistakes: Array.isArray(result.commonMistakes)
      ? result.commonMistakes.slice(0, 6)
      : [],
    timeComplexity: result.timeComplexity || "",
    spaceComplexity: result.spaceComplexity || "",
    similarProblems: Array.isArray(result.similarProblems)
      ? result.similarProblems.slice(0, 3).map((problem) => ({
          title: problem.title || "",
          url: problem.url || "",
          difficulty: ["Easy", "Medium", "Hard"].includes(problem.difficulty)
            ? problem.difficulty
            : "Medium",
          whySimilar: problem.whySimilar || "",
        }))
      : [],
  };
};

module.exports = {
  analyzeDsaSolution,
};
