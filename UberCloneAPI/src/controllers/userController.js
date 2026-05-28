const User = require("../models/User");

// ======================
// GET PROFILE
// ======================

const getProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// ======================
// UPDATE PROFILE
// ======================

const updateProfile = async (req, res) => {
  try {

    const {
      fullName,
      phone,
      gender,
      language,
      profileImage
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        fullName,
        phone,
        gender,
        language,
        profileImage
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  getProfile,
  updateProfile
};