const JobApplication = require("../models/jobApplication.model");
const { parseJobPost } = require("./jobGemini.service");

const parseAndPreviewJob = async (rawText) => {
  const parsedData = await parseJobPost(rawText);
  if (!parsedData) {
    throw new Error("Could not parse job posting.");
  }
  return parsedData;
};

const saveJobApplication = async (userId, payload) => {
  const job = new JobApplication({
    ...payload,
    createdBy: userId,
  });
  await job.save();
  return job;
};

const getJobsByUser = async (userId) => {
  return await JobApplication.find({ createdBy: userId }).sort({ createdAt: -1 });
};

const updateJobStatus = async (jobId, userId, status) => {
  const job = await JobApplication.findOneAndUpdate(
    { _id: jobId, createdBy: userId },
    { status },
    { new: true }
  );
  return job;
};

module.exports = {
  parseAndPreviewJob,
  saveJobApplication,
  getJobsByUser,
  updateJobStatus,
};
