const Application = require("../models/Application");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const Candidate = require("../models/Candidate");
const bcrypt = require("bcrypt");
const router = require("express").Router();
const Job = require("../models/Job");

router.get("/applications", auth, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("job")
      .populate("candidate");
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applications" });
  }
});

module.exports = router;
