// --------------------- routes/deadlines.routes.js ---------------------

const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/deadline.controller");

router.post("/", auth, controller.createDeadline);
router.get("/", auth, controller.getDeadlines);
router.patch("/:id/status", auth, controller.updateStatus);
router.delete("/:id", auth, controller.deleteDeadline);

module.exports = router;