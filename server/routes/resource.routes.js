const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resource.controller');
const { upload } = require('../middlewares/cloudinary.config');

// === ZAROORI BADLAAV ===
// Hum yahaan auth middleware ko seedhe import karenge.
// Isse farak nahi padta ki aapne 'protect' naam se export kiya hai ya seedhe.
const authMiddleware = require('../middlewares/auth.middleware');

// Resource upload karne ka route
router.post(
  '/upload',
  authMiddleware, // Hum yahaan import kiye gaye variable ko seedhe istemaal kar rahe hain
  upload.single('resource'),
  resourceController.uploadResource
);

// Ek topic ke saare resources paane ka route
router.get(
    '/topic/:topicId',
    authMiddleware,
    resourceController.getResourcesByTopic
);

// Ek resource ko uski ID se delete karne ka route
router.delete(
    '/:id',
    authMiddleware,
    resourceController.deleteResource
);

module.exports = router;
