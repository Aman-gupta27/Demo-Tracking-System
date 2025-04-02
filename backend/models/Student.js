const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [3, "Name must be at least 3 characters long"],
    maxlength: [50, "Name must be at most 50 characters long"]
  },
  mobileNumber: {
    type: String,
    required: [true, "Mobile number is required"],
    unique: true,
    trim: true,
    match: [/^\d{10}$/, "Mobile number must be exactly 10 digits"]
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, "Email is required"],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true // Prevents modification after creation
  }
});

module.exports = mongoose.model('Student', StudentSchema);
