const Employer = require("../models/Employer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Application = require("../models/Application");
const Candidate = require("../models/Candidate");
const Job = require("../models/Job");

//GET ALL JOBS BY EMPLOYER CONTROLLER
const getEmployer = async (req, res) => {
  try {
    const employer = await Employer.findById(req.user.id)
      .select("-password")
      .populate("jobsPosted");
    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }
    res.status(200).json({ employer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET ALL APPLICATIONS BY EMPLOYER CONTROLLER
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate({
        path: "job",
        match: { employer: req.user.id }, // Filter jobs by the employer ID
        select: "title location", // Optionally select fields from the job
      })
      .populate({
        path: "candidate",
        select: "name email", // Select name and email for the candidate
      })
      .lean();
    if (applications.length === 0) {
      return res.status(404).json({ message: "No applications found" });
    }
    // Filter out applications without a job
    const employerApplications = applications.filter(
      (application) => application.job !== null
    );
    if (employerApplications.length === 0) {
      return res.status(404).json({ message: "No applications found" });
    }

    res.status(200).json({ employerApplications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//DELETE APPLICATION BY EMPLOYER CONTROLLER
const deleteApplication = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const application = await Application.findById(id).populate("job");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    await Candidate.findByIdAndUpdate(application.candidate, {
      $pull: { appliedJobs: application.job }, // Remove the job from the candidate's appliedJobs
    });

    await Employer.findByIdAndUpdate(application.job.employer, {
      $pull: { jobsPosted: application.job.id }, // Remove the application from the job's applications array
    });

    await Job.findByIdAndUpdate(application.job, {
      $pull: { applications: id }, // Remove the application from the job's applications array
    });

    await application.deleteOne();
    res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//REGISTER EMPLOYER CONTROLLER
const registerEmployer = async (req, res) => {
  const { name, email, password, companySize, location } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const employer = new Employer({
      name,
      email,
      password: hashedPassword,
      companySize,
      location,
    });
    const savedEmployer = await employer.save();
    res.status(201).json(savedEmployer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//LOGIN EMPLOYER CONTROLLER
const loginEmployer = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const employer = await Employer.findOne({ email });
    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }
    const isMatch = await bcrypt.compare(password, employer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: employer._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({
      id: employer._id,
      name: employer.name,
      email: employer.email,
      companySize: employer.companySize,
      location: employer.location,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//LOGOUT EMPLOYER CONTROLLER
const logoutEmployer = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  getEmployer,
  getAllApplications,
  deleteApplication,
  registerEmployer,
  loginEmployer,
  logoutEmployer,
};
