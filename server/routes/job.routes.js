const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth.middleware");

const {
  parseJob,
  createJob,
  getMyJobs,
  updateStatus,
} = require("../controllers/job.controller");

router.post("/parse", authenticate, parseJob);
router.post("/", authenticate, createJob);
router.get("/", authenticate, getMyJobs);
router.patch("/:id/status", authenticate, updateStatus);

module.exports = router;
