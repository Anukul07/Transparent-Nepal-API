const User = require("../models/userModel");
const Job = require("../models/jobModel");

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

// Update user by ID
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

exports.uploadResume = async (req, res) => {
  // Check if userId and file are present in the request
  if (!req.body.userId || !req.file) {
    return res
      .status(400)
      .json({ message: "User ID and resume are required." });
  }

  try {
    // Find user by userId
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Save the file path in the user's uploadedResume field
    user.uploadedResume = req.file.filename; // Store the filename in the user's document
    await user.save();

    // Send success response
    res.status(200).json({
      message: "Resume uploaded successfully!",
      file: req.file.filename, // Return the filename or file path
    });
  } catch (err) {
    console.error("Error uploading resume:", err);
    res
      .status(500)
      .json({ message: "Error uploading resume, please try again." });
  }
};

//save jobs
exports.saveJob = async (req, res) => {
  try {
    const jobId = req.body.jobId; // Get jobId from request body
    const userId = req.body.userId; // Get user ID from authenticated request (ensure authentication middleware is used)
    console.log(jobId);
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Find user and update savedJobs
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prevent duplicate saves
    if (user.savedJobs.includes(jobId)) {
      return res
        .status(400)
        .json({ success: false, message: "Job already saved" });
    }

    user.savedJobs.push(jobId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Job saved successfully",
      savedJobs: user.savedJobs, // Return updated savedJobs
    });
  } catch (error) {
    console.error("Error saving job:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Fetch saved jobs for a user
exports.getSavedJobs = async (req, res) => {
  try {
    const userId = req.body.userId;
    console.log(userId);
    // Find user and populate saved jobs
    const user = await User.findById(userId).populate("savedJobs");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, savedJobs: user.savedJobs });
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
