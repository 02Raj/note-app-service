const express = require('express');
const router = express.Router();
const revisionController = require('../controllers/revision.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/due', revisionController.getDueNotes);
router.get('/drill', revisionController.getDrill);
router.get('/weak', revisionController.getWeakNotes);
router.post('/:id/complete', revisionController.markAsRevised);

module.exports = router;