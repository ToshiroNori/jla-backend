const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const candidateSchema = new Schema({
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
  resume: {
    type: String, // URL to resume file or resume data
    required: true,
  },
  appliedJobs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Job", // Array of jobIds the candidate has applied to
    },
  ],
});

module.exports = mongoose.model("Candidate", candidateSchema);
