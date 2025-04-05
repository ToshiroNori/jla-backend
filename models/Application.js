const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const applicationSchema = new Schema({
  job: {
    type: Schema.Types.ObjectId,
    ref: "Job", // Reference to the job applied for
    required: true,
  },
  candidate: {
    type: Schema.Types.ObjectId,
    ref: "Candidate", // Reference to the candidate applying
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Interview", "Rejected", "Accepted"],
    default: "Pending", // Initial status is "Pending"
  },
  dateApplied: {
    type: Date,
    default: Date.now, // Date the application was submitted
  },
});

module.exports = mongoose.model("Application", applicationSchema);
