const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Please provide company name"],
      unique: true,
    },
    companyDescription: {
      type: String,
      required: [true, "Please provide company description"],
    },
    companyLogo: {
      type: String, // Stores image URL or file path
      default: null,
    },
    companyRatings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    jobListings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
