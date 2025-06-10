const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt =require("jsonwebtoken");

const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  // Create a new user instance. The 'role' will be set to 'admin' by default from your schema.
  const user = new User({ name, email, passwordHash });
  await user.save();

  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Return the user's role so the frontend knows their permissions
  return { user: { name: user.name, email: user.email, _id: user._id, role: user.role }, token };
};
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // Include the user's role in the JWT payload for secure backend checks
  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  
  // Return user data without role to match the expected response format
  return { 
    user: { 
      name: user.name, 
      email: user.email, 
      role:user.role,
      _id: user._id
    }, 
    token 
  };
};

module.exports = {
  registerUser,
  loginUser,
};
