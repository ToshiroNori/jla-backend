// models/User.js
const mongoose = require("mongoose");

// Define the User schema
const employerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
); // Automatically add createdAt and updatedAt fields

const Employer = mongoose.model("Employer", employerSchema);

module.exports = Employer;
