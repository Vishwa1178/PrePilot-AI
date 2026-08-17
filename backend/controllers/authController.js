const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, targetRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      targetRole: targetRole || "",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        avatarInitials: user.avatarInitials,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        avatarInitials: user.avatarInitials,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in user's profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is already attached by the protect middleware (password excluded)
    res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile (name / targetRole)
 * @route   PUT /api/auth/me
 * @access  Private
 */
const updateMe = async (req, res, next) => {
  try {
    const { name, targetRole } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (targetRole !== undefined) user.targetRole = targetRole;

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        targetRole: updatedUser.targetRole,
        avatarInitials: updatedUser.avatarInitials,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getMe, updateMe };
