const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");
const { create, getAll, remove } = require("../controllers/topics.controller");

router.post("/", authenticate, create);
router.get("/", authenticate, getAll);
router.delete("/:id", authenticate, remove);

module.exports = router;
