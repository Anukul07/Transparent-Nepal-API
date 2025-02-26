const Job = require("../models/jobModel");
const Company = require("../models/companyModel");
const mongoose = require("mongoose");

// ✅ Create a new job (with company reference)
const createJob = async (req, res) => {
  try {
    const {
      jobName,
      jobLocation,
      salaryRange,
      jobDescription,
      companyId, // Reference to company
    } = req.body;

    // Validate companyId (make sure it exists)
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(400).json({
        success: false,
        message: "Company not found",
      });
    }

    // Create job with company reference
    const newJob = await Job.create({
      jobName,
      jobLocation,
      salaryRange,
      jobDescription,
      companyId: companyId, // Company reference
      companyLogo: company.companyLogo, // Optional: add company logo if needed
      companyRatings: company.companyRatings, // Optional: add company ratings if needed
    });

    // Optionally, add this job to the company's jobListings
    company.jobListings.push(newJob._id);
    await company.save();

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job: newJob,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get all jobs (with company details)
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate(
      "companyId",
      "companyName companyLogo companyRatings companyDescription" // Populate company details
    );

    if (!jobs.length) {
      return res.status(404).json({ success: false, message: "No jobs found" });
    }

    res.status(200).json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get a single job by ID (with company details)
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate(
      "company",
      "companyName companyLogo companyRatings" // Populate company details
    );

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Update a job (including company reference if necessary)
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobName, jobLocation, salaryRange, jobDescription, companyId } =
      req.body;

    // Validate companyId if provided
    if (companyId) {
      const company = await Company.findById(companyId);
      if (!company) {
        return res
          .status(400)
          .json({ success: false, message: "Company not found" });
      }
    }

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { jobName, jobLocation, salaryRange, jobDescription, company: companyId },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Delete a job
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Optionally, remove the job from the company's jobListings
    const company = await Company.findById(job.company);
    if (company) {
      company.jobListings.pull(job._id);
      await company.save();
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
};
