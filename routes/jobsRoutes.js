const Job = require("../models/Job");
const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("Jobs route");
});

router.post("/create", (req, res) => {
  const { title, description, company, location, salary } = req.body;

  // Validate the input data
  if (!title || !description || !company || !location || !salary) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Create a new job
  const newJob = new Job({
    title,
    description,
    company,
    location,
    salary,
    employer: req.user._id, // Assuming req.user is set after authentication
  });

  newJob
    .save()
    .then((job) => res.status(201).json(job))
    .catch((err) => res.status(500).json({ message: err.message }));
});

module.exports = router;
