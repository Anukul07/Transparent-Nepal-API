const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      profilePicture,
      role,
    } = req.body;

    // Check if required fields are missing
    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      return res.status(400).json({
        status: "fail",
        message: "All required fields must be provided.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: "fail",
        message: "Email is already registered. Please log in.",
      });
    }

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      profilePicture,
      role,
    });

    // Remove password from response
    newUser.password = undefined;

    // Generate JWT token
    const token = signToken(newUser);

    res.status(201).json({
      status: "success",
      token,
      message: "User registered successfully!",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        profilePicture: newUser.profilePicture,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);

    res.status(500).json({
      status: "error",
      message:
        "An unexpected error occurred during signup. Please try again later.",
      error: err.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if both email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide both email and password",
      });
    }

    // Find user by email and verify password
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    // If credentials match, generate token and respond
    const token = signToken(user);
    res.status(200).json({
      status: "success",
      userId: user._id,
      token,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};
exports.uploadImage = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).send({ message: "Please upload a file" });
  }
  res.status(200).json({
    success: true,
    data: req.file.filename,
  });
};

exports.globalErrorHandler = (err, req, res, next) => {
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).json({
    status: "failed",
    message: err.message || "An unexpected error occurred",
  });
};
