const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  datePosted: {
    type: Date,
    default: Date.now,
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employer",
    required: true,
  },
});

const Job = mongoose.model("Jobs", jobSchema);
module.exports = Job;
