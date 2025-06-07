// /middlewares/cloudinary.config.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const config = require('../config/env');


cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'preparation_resources', 
    allowed_formats: ['jpg', 'png', 'pdf', 'jpeg'],
    // public_id: (req, file) => 'computed-filename-using-request',
  },
});
const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };