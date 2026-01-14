const Contact = require("../models/contact.model");

// POST – Save contact message
const submitContactService = async (data) => {
  const { name, email, subject, message } = data;

  if (!name || !email || !message) {
    throw new Error("Name, Email and Message are required");
  }

  const contact = await Contact.create({
    name,
    email,
    subject,
    message
  });

  return contact;
};

// ✅ GET ALL – Fetch all contact messages
const getAllContactsService = async () => {
  return await Contact.find().sort({ createdAt: -1 });
};

module.exports = {
  submitContactService,
  getAllContactsService
};
