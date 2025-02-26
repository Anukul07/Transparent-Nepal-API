const Company = require("../models/companyModel");
const Job = require("../models/jobModel");
const fs = require("fs");
const path = require("path");

// ✅ Create a new company
const createCompany = async (req, res) => {
  try {
    const { companyName, companyDescription } = req.body;

    // Check if company already exists
    const existingCompany = await Company.findOne({ companyName });
    if (existingCompany) {
      return res
        .status(400)
        .json({ success: false, message: "Company already exists" });
    }

    // Handle image upload
    const companyLogo = req.file ? req.file.filename : null;

    const company = await Company.create({
      companyName,
      companyDescription,
      companyLogo,
    });

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      company,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get all companies
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().populate(
      "jobListings",
      "jobName salaryRange jobLocation"
    );

    if (!companies.length) {
      return res
        .status(404)
        .json({ success: false, message: "No companies found" });
    }

    // Modify companyLogo to include the full path
    const companiesWithFullPath = companies.map((company) => ({
      ...company.toObject(),
      companyLogo: company.companyLogo ?? null,
    }));

    res.status(200).json({ success: true, companies: companiesWithFullPath });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get a single company by ID
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id).populate("jobListings");

    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    // Modify companyLogo to include the full path
    company.companyLogo = company.companyLogo ?? null;

    res.status(200).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Update company details
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;

    let updateData = { ...req.body };

    // Handle new image upload
    if (req.file) {
      const company = await Company.findById(id);
      if (!company) {
        return res
          .status(404)
          .json({ success: false, message: "Company not found" });
      }

      // Delete old logo if exists
      if (company.companyLogo) {
        const oldImagePath = path.join(
          __dirname,
          "..",
          "public",
          company.companyLogo
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      updateData.companyLogo = req.file.filename;
    }

    const updatedCompany = await Company.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedCompany) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    // Modify companyLogo to include the full path
    updatedCompany.companyLogo = updatedCompany.companyLogo
      ? `http://localhost:5000${updatedCompany.companyLogo}`
      : null;

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      updatedCompany,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Delete a company
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);

    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    // Remove company logo if it exists
    if (company.companyLogo) {
      const imagePath = path.join(
        __dirname,
        "..",
        "public",
        company.companyLogo
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Remove all jobs linked to this company
    await Job.deleteMany({ _id: { $in: company.jobListings } });

    // Delete the company itself
    await company.deleteOne();

    res.status(200).json({
      success: true,
      message: "Company and related jobs deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
};
