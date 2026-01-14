const express = require("express");
const {
  submitContact,
  getAllContacts
} = require("../controllers/contact.controller");

const router = express.Router();

// 🔓 PUBLIC – contact form submit
router.post("/", submitContact);

// 🔐 ADMIN – get all contact messages
router.get("/", getAllContacts);

module.exports = router;
