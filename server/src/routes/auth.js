// routes/auth.js
import express from "express";
import User from "../models/User.js";
import Taxpayer from "../models/Taxpayer.js";
import ErrorResponse from "../lib/errorResponse.js";
import asyncHandler from "../middleware/async.js";
// import { sendEmail } = from "../utils/sendEmail";
import crypto from "crypto";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Helper function
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain:
      process.env.NODE_ENV === "production" ? "yourdomain.com" : "localhost",
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenant: user.tenant._id ? user.tenant._id.toString() : user.tenant,
      },
    });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
router.post(
  "/register",
  asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password, role, tenant } = req.body;

    // Check if tenant exists
    const taxpayer = await Taxpayer.findById(tenant);
    if (!taxpayer) {
      return next(
        new ErrorResponse(`Taxpayer not found with id ${tenant}`, 404)
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(
        new ErrorResponse(`User already exists with email ${email}`, 400)
      );
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      tenant,
    });

    sendTokenResponse(user, 200, res);
  })
);

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
router.post(
  "/login",
  asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new ErrorResponse("Please provide an email and password", 400)
      );
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    sendTokenResponse(user, 200, res);
  })
);

// Update Details
router.put(
  "/updatedetails",
  asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  })
);

// Update Password
router.put(
  "/updatepassword",
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new ErrorResponse("Password is incorrect", 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  })
);

// Forgot Password
router.post(
  "/forgotpassword",
  asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse("There is no user with that email", 404));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password reset token",
        message,
      });

      res.status(200).json({ success: true, data: "Email sent" });
    } catch (err) {
      console.error(err);
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  })
);

// Reset Password
router.put(
  "/resetpassword/:resettoken",
  asyncHandler(async (req, res, next) => {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid token", 400));
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  })
);

// Me
router.get(
  "/me",
  protect, // Add this middleware
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate("tenant");

    res.status(200).json({
      success: true,
      data: user,
    });
  })
);

export default router;
