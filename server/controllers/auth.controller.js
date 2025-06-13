const { registerUser, loginUser, updateUserProfile } = require("../services/user.service");
const { successResponse, errorResponse } = require("../utils/responseHelper");

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return errorResponse(res, "All fields are required", 400);
    }
    const result = await registerUser({ name, email, password });
    return successResponse(res, result, "User registered successfully", 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

/**
 * @desc Login user
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, "Email and password required", 400);
    }
    const result = await loginUser({ email, password });
    return successResponse(res, result, "Login successful", 200);
  } catch (err) {
    return errorResponse(res, err.message, 401);
  }
};

// --- NEW CONTROLLER FOR PROFILE UPDATE ---
/**
 * @desc Update user profile
 * @route PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Get user ID from the authenticated token
        const profileData = req.body;
        const file = req.file; // Get file from multer upload

        const updatedUser = await updateUserProfile(userId, profileData, file);
        return successResponse(res, updatedUser, "Profile updated successfully");
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

module.exports = {
  register,
  login,
  updateProfile // Export the new controller
};
