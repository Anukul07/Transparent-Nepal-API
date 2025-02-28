const User = require("../models/userModel");
const Job = require("../models/jobModel");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

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
exports.updateUserWithImage = async (req, res) => {
  console.log("Request Body:", req.body);
  console.log("Uploaded File:", req.file);
  try {
    const { userId, email, phoneNumber, firstName, lastName } = req.body;

    if (!userId) {
      return res.status(400).json({
        status: "fail",
        message: "User ID is required",
      });
    }

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Prepare update object
    const updateData = {};
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    // Handle profile picture upload
    if (req.file) {
      // Delete the old profile picture if it exists
      if (user.profilePicture) {
        const oldImagePath = path.join(
          __dirname,
          "..",
          "public/uploads",
          path.basename(user.profilePicture)
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Delete old image file
        }
      }

      // Set new profile picture URL
      updateData.profilePicture = req.file.filename;
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: { user: updatedUser },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};
exports.sendUploadEmail = async (req, res) => {
  const { email, fileName } = req.body;
  const filePath = path.join(
    __dirname,
    "..",
    "public",
    "uploads",
    "resumes",
    fileName
  );

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Or your SMTP host
      port: 587, // Or your SMTP port (587 for TLS, 465 for SSL)
      secure: false, // Use `true` for 465, `false` for other ports
      auth: {
        user: "transparentnepal1@gmail.com", // Replace with your email
        pass: "dltttdcnkbeyxsda", // Replace with your password or app-specific password
      },
      tls: {
        ciphers: "SSLv3",
      },
    });

    const mailOptions = {
      from: "transparentnepal1@gmail.com",
      to: email,
      subject: "Application forwared",
      text: "Greetings from transparent nepal, your resume has been successfully forwarded to your desired company",
      attachments: [
        {
          filename: fileName,
          path: filePath,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
};
exports.applyJob = async (req, res) => {
  try {
    const jobId = req.body.jobId;
    const userId = req.body.userId;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Find user and update appliedJobs
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prevent duplicate applications
    if (user.appliedJobs.includes(jobId)) {
      return res
        .status(400)
        .json({ success: false, message: "Job already applied" });
    }

    user.appliedJobs.push(jobId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Job applied successfully",
      appliedJobs: user.appliedJobs,
    });
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
