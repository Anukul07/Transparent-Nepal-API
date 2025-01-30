const User = require("../models/userModel");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(500).json({
      status: "error",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    console.log(err);
  }
};
