const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: [true, "Password is required"]
  },
  role: {
    type: String,
    default: 'admin',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
