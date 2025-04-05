const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobSchema = new Schema({
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
  employer: {
    type: Schema.Types.ObjectId,
    ref: "Employer", // Reference to the employer who posted the job
    required: true,
  },
  applications: [
    {
      type: Schema.Types.ObjectId,
      ref: "Application", // References to applications for this job
    },
  ],
  datePosted: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Job", jobSchema);
