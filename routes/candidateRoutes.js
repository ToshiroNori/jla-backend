const router = require("express").Router();
const Job = require("../models/Job");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Candidate = require("../models/Candidate");
const Application = require("../models/Application");
const {
  jobList,
  registerCandidate,
  loginCandidate,
  applyForJob,
  getAllApplications,
  logoutCandidate,
  getCandidate,
} = require("../controllers/candidateController");

//GET ALL JOBS
router.get("/", auth, getCandidate);

//REGISTER CANDIDATE
router.post("/register", registerCandidate);

//LOGIN CANDIDATE
router.post("/login", loginCandidate);

//APPLY FOR JOB
router.post("/apply/:jobId", auth, applyForJob);

//Get ALL APPLICATIONS
router.get("/applications", auth, getAllApplications);

//LOGOUT CANDIDATE
router.post("/logout", logoutCandidate);

module.exports = router;
