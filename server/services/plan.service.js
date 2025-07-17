const Plan = require("../models/plan.model");
const { geminiService } = require("./gemini.service");

class PlanService {
async createPlanFromAI(userId, availableHoursPerDay, priorityTopics, numberOfDays = 7) {
  const prompt = `
    You are an intelligent learning assistant. Create a ${numberOfDays}-day study plan.

    - Available hours per day (array of length ${numberOfDays}): ${JSON.stringify(availableHoursPerDay)}
    - Priority Topics: ${priorityTopics.join(", ")}

    Return JSON array like:
    [
      {
        "date": "YYYY-MM-DD",
        "topic": "Topic name",
        "subtopic": "Subtopic name",
        "expectedHours": number
      },
      ...
    ]
  `;

  const planArray = await geminiService.generateJson(prompt);

  const enrichedPlan = planArray.map(p => ({
    ...p,
    userId,
    status: "pending",
    date: new Date(p.date)
  }));

  await Plan.insertMany(enrichedPlan);
  return enrichedPlan;
}


  async markStatus(planId, status) {
    const updated = await Plan.findByIdAndUpdate(planId, { status }, { new: true });
    return updated;
  }

  async getUserPlans(userId) {
    return await Plan.find({ userId }).sort({ date: 1 });
  }

  async getPlanProgress(userId) {
    const plans = await Plan.find({ userId });
    const total = plans.length;
    const completed = plans.filter(p => p.status === "completed").length;
    const missed = plans.filter(p => p.status === "missed").length;
    const pending = total - completed - missed;

    return {
      total,
      completed,
      missed,
      pending,
      completionRate: Math.round((completed / total) * 100) || 0
    };
  }
}

module.exports = new PlanService();
