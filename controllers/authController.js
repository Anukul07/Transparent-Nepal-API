const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = async (req, res, next) => {
  try {
    // const profilePicture = req.file ? req.file.filename : null;
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      phoneNumber: req.body.phoneNumber,
      profilePicture: req.body.profilePicture,
    });
    newUser.password = undefined;
    const token = signToken(newUser._id);
    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    console.log("Error occurred", err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const error = new Error("Please provide both email and password");
      error.statusCode = 400;
      return next(error);
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      const error = new Error("Credentials do not match a user");
      error.statusCode = 401;
      return next(error);
    }
    const token = signToken(user._id);
    res.status(200).json({
      status: "success",
      userId: user._id,
      token,
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
