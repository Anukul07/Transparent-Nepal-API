const express = require("express");
const jobController = require("../controllers/jobController");
const verifyToken = require("./../middlewares/authMiddleware");
const authorizeRoles = require("./../middlewares/roleMiddleware");
const router = express.Router();

// ✅ Create a new job
router.post("/", jobController.createJob);

// ✅ Get all jobs
router.get(
  "/",
  verifyToken,
  authorizeRoles("user", "admin"),
  jobController.getAllJobs
);

// ✅ Get a single job by ID
router.get("/:id", jobController.getJobById);

// ✅ Update a job by ID
router.patch("/:id", jobController.updateJob);

// ✅ Delete a job by ID
router.delete("/:id", jobController.deleteJob);
// router.get("/search", jobController.searchJobs);
module.exports = router;
