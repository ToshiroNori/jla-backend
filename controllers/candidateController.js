const Job = require("../models/Job");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Candidate = require("../models/Candidate");
const Application = require("../models/Application");

//GET ALL JOBS CONTROLLER
const jobList = async (req, res) => {
  try {
    const jobList = await Job.find();
    res.status(200).json(jobList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs" });
  }
};

const getCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id).populate(
      "appliedJobs"
    );
    if (!candidate) {
      res.status(404).json({ message: "Candidate not found" });
    }
    res.status(200).json({
      name: candidate.name,
      email: candidate.email,
      appliedJobs: [...candidate.appliedJobs],
    });
  } catch (err) {}
};

const registerCandidate = async (req, res) => {
  const { name, email, password, resume } = req.body;

  if (!name || !email || !password || !resume) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newCandidate = new Candidate({
      name,
      email,
      password: hashedPassword,
      resume,
    });

    await newCandidate.save();
    res.status(201).json({ message: "Candidate registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering candidate" });
  }
};

//LOGIN CANDIDATE CONTROLLER
const loginCandidate = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const candidate = await Candidate.findOne({ email });
    if (!candidate) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, candidate.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: candidate._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE.ENV === "production", // set true in production
        sameSite: "Strict", // or "Lax"
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        candidate: {
          id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          resume: candidate.resume,
        },
        message: "Login successful",
        token,
      });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};

//APPLY FOR JOB CONTROLLER
const applyForJob = async (req, res) => {
  const jobId = req.params.jobId;
  const candidateId = req.user.id; // Assuming you have the candidate's ID in req.user

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Check if the candidate has already applied for this job
    if (candidate.appliedJobs.includes(jobId)) {
      return res.status(400).json({ message: "Already applied for this job" });
    }

    candidate.appliedJobs.push(jobId);
    await candidate.save();

    // Optionally, you can also create an application record
    try {
      const application = new Application({
        job: jobId,
        candidate: candidateId,
      });
      await application.save();
      job.applications.push(application._id);
      await job.save();
    } catch (error) {
      return res.status(500).json({ message: "Error saving application" });
    }

    res.status(200).json({ message: "Application successful" });
  } catch (error) {
    res.status(500).json({ message: "Error applying for job" });
  }
};

//GET ALL APPLICATIONS CONTROLLER
const getAllApplications = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id).populate(
      "appliedJobs"
    );
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json(candidate.appliedJobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applications" });
  }
};

//LOGOUT CANDIDATE CONTROLLLER
const logoutCandidate = async (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logout successful" });
};

module.exports = {
  getCandidate,
  registerCandidate,
  loginCandidate,
  applyForJob,
  getAllApplications,
  logoutCandidate,
  jobList,
};
