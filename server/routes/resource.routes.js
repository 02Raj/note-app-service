// /routes/resource.routes.js
const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resource.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/cloudinary.config');

router.post(
  '/upload',
  authMiddleware,
  upload.single('resource'),
  resourceController.uploadResource
);

module.exports = router;