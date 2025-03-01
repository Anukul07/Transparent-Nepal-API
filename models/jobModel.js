const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    jobName: {
      type: String,
      required: [true, "Please provide a job name"],
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      
    },
    jobLocation: {
      type: String,
      required: [true, "Please provide job location"],
    },
    salaryRange: {
      type: String,
      required: [true, "Please provide salary range (e.g. '10000-20000')"],
    },
    jobPosted: {
      type: Date,
      default: Date.now,
    },
    jobDescription: {
      type: String,
      required: [true, "Please provide job description"],
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
