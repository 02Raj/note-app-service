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
    enum: ['user', 'Student'], // Changed 'admin' to 'Student'
    default: 'user',
    required: true
  },
  // --- NEW FIELDS FOR USER PROFILE ---
  jobProfile: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  avatar: {
    public_id: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/v1625195551/default_avatar.png' // A default avatar
    }
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
