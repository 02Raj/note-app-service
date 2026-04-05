const HR = require("../models/hr.model");

exports.createHR = async (userId, data) => {
  return await HR.create({
    ...data,
    userId
  });
};

exports.getAllHR = async (userId) => {
  return await HR.find({ userId }).sort({ createdAt: -1 });
};

exports.getHRById = async (userId, hrId) => {
  return await HR.findOne({ _id: hrId, userId });
};

exports.updateHR = async (userId, hrId, data) => {
  return await HR.findOneAndUpdate(
    { _id: hrId, userId },
    data,
    { new: true }
  );
};

exports.updateStatus = async (userId, hrId, status) => {
  return await HR.findOneAndUpdate(
    { _id: hrId, userId },
    { status },
    { new: true }
  );
};
