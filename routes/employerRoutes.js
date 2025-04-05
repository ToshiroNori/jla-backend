const router = require("express").Router();
const auth = require("../middleware/auth");

const {
  getEmployer,
  getAllApplications,
  deleteApplication,
  registerEmployer,
  loginEmployer,
  logoutEmployer,
} = require("../controllers/employerController");

//GET ALL JOBS BY EMPLOYER
router.get("/", auth, getEmployer);

//GET ALL APPLICATIONS BY EMPLOYER
router.get("/applications", auth, getAllApplications);

//DELETE APPLICATION BY EMPLOYER
router.delete("/application/:id", auth, deleteApplication);

//LOGIN EMPLOYER
router.post("/login", loginEmployer);

//REGISTER EMPLOYER
router.post("/register", registerEmployer);

//LOGOUT EMPLOYER
router.post("/logout", logoutEmployer);

module.exports = router;
