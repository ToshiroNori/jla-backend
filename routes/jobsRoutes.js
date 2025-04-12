const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  getAlljobs,
  getJobs,
  createJob,
  deleteJob,
  updateJob,
} = require("../controllers/jobController");

// Get all jobs for the logged-in employer
router.get("/", auth, getAlljobs);

// Create a new job (for the logged-in employer)
router.post("/create", auth, createJob);

// Delete a job (only the employer who created it can delete it)
router.delete("/delete/:id", auth, deleteJob);

// Update a job (only the employer who created it can update it)
router.put("/update/:id", auth, updateJob);

module.exports = router;
