// /routes/revision.routes.js

const express = require('express');
const router = express.Router();
const revisionController = require('../controllers/revision.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// This middleware will ensure that only logged-in users can access these routes
router.use(authMiddleware);

// Route to get today's due revision notes
// GET /api/revisions/due
router.get('/due', revisionController.getDueNotes);

// Route to mark a note as 'revised'
// POST /api/revisions/:id/complete
router.post('/:id/complete', revisionController.markAsRevised);

module.exports = router;