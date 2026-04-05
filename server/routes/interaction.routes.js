const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/interaction.controller");

router.post("/", auth, controller.createInteraction);
router.get("/hr/:hrId", auth, controller.getByHR);

module.exports = router;
