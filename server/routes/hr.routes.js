const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/hr.controller");

router.post("/", auth, controller.createHR);
router.get("/", auth, controller.getAllHR);
router.get("/:id", auth, controller.getHRById);
router.put("/:id", auth, controller.updateHR);
router.patch("/:id/status", auth, controller.updateStatus);

module.exports = router;
