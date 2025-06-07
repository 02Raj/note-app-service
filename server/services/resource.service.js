// /services/resource.service.js
const Resource = require('../models/resource.model');
const { cloudinary } = require('../middlewares/cloudinary.config');

const saveResource = async (fileData, userId, topicId, subtopicId) => {
  const resource = new Resource({
    name: fileData.originalname,
    url: fileData.path, 
    cloudinary_id: fileData.filename,
    fileType: fileData.mimetype,
    createdBy: userId,
    topicId: topicId || null,
    subtopicId: subtopicId || null,
  });
  return await resource.save();
};

const getResourcesByTopic = async (topicId, userId) => {
  return await Resource.find({ topicId, createdBy: userId });
};

const deleteResource = async (id, userId) => {
  const resource = await Resource.findOne({ _id: id, createdBy: userId });
  if (!resource) {
    throw new Error('Resource not found or unauthorized');
  }
  // पहले Cloudinary से फाइल डिलीट करें
  await cloudinary.uploader.destroy(resource.cloudinary_id);
  // फिर डेटाबेस से डॉक्यूमेंट डिलीट करें
  return await Resource.findByIdAndDelete(id);
};

module.exports = { saveResource, getResourcesByTopic, deleteResource };