const router = require("express").Router();
const Employer = require("../models/Employer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  // Check if the user is authenticated
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

router.get("/", isAuthenticated, async (req, res) => {
  try {
    // Fetch all employers from the database
    const employers = await Employer.find();
    res.status(200).json(employers, req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /register - Register a new employer
router.post("/register", async (req, res) => {
  const { name, email, password, company } = req.body;

  // Validate the input data
  if (!name || !email || !password || !company) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the employer already exists
    const existingEmployer = await Employer.findOne({ email });
    if (existingEmployer) {
      return res.status(400).json({ message: "Employer already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new employer
    const newEmployer = new Employer({
      name,
      email,
      password: hashedPassword, // You should hash the password here
      company,
    });

    // Save the new employer to the database
    await newEmployer.save();

    res.status(201).json({ message: "Employer registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /login - Employer login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate the input data
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if the employer exists
    const employer = await Employer.findOne({ email });
    if (!employer) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, employer.password); // Ensure matchPassword is defined in your Employer schema
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Set the user in the request object (this part is often used for setting up sessions or tokens)
    const token = jwt.sign({ id: employer._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set the token in a cookie (optional)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1 hour
    });
    // Send the token in the response (optional)
    res
      .status(200)
      .json({ message: "Employer logged in successfully", employer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
