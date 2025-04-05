const Job = require("../models/Job");
const Employer = require("../models/Employer");
const router = require("express").Router();
const auth = require("../middleware/auth");

// Get all jobs for the logged-in employer
router.get("/", auth, async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id });
    if (jobs.length === 0) {
      return res.status(404).json({ message: "No jobs found" });
    }
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new job (for the logged-in employer)
router.post("/create", auth, async (req, res) => {
  const { title, description, company, location, salary } = req.body;

  if (!title || !description || !company || !location || !salary) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const isEmployer = await Employer.findById(req.user.id);
    if (!isEmployer) {
      return res.status(404).json({ message: "Not an employer" });
    }

    const newJob = new Job({
      title,
      description,
      company,
      location,
      salary,
      employer: req.user.id,
    });

    await Employer.findByIdAndUpdate(req.user.id, {
      $push: { jobsPosted: newJob._id },
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a job (only the employer who created it can delete it)
router.delete("/delete/:id", auth, async (req, res) => {
  const jobId = req.params.id;

  if (!jobId) {
    return res.status(400).json({ message: "Job ID is required" });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.employer.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this job" });
    }

    await Job.findByIdAndDelete(jobId);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a job (only the employer who created it can update it)
router.put("/update/:id", auth, async (req, res) => {
  const jobId = req.params.id;
  const { title, description, company, location, salary } = req.body;

  if (!title || !description || !company || !location || !salary) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.employer.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You do not have permission to update this job" });
    }

    job.title = title;
    job.description = description;
    job.company = company;
    job.location = location;
    job.salary = salary;

    await job.save();
    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
