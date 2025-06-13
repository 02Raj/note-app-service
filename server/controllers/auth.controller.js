const { registerUser, loginUser } = require("../services/user.service");
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
    return successResponse(res, {
  name: result.user.name,
  email: result.user.email,
  role:result.user.role,
  _id: result.user._id,
  token: result.token
}, "Login successful", 200);

  } catch (err) {
    return errorResponse(res, err.message, 401);
  }
};

module.exports = {
  register,
  login,
};
