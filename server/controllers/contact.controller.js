const {
  submitContactService,
  getAllContactsService
} = require("../services/contact.service");

const {
  successResponse,
  errorResponse
} = require("../utils/responseHelper");

// POST – public
const submitContact = async (req, res) => {
  try {
    const result = await submitContactService(req.body);
    return successResponse(res, result, "Message sent successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// ✅ GET – admin / dashboard
const getAllContacts = async (req, res) => {
  try {
    const contacts = await getAllContactsService();
    return successResponse(res, contacts, "Contacts fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  submitContact,
  getAllContacts
};
