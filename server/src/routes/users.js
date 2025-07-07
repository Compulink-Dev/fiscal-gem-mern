// routes/users.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, authorize, setTenantContext } = require("../middleware/auth");
const { tenantAuth } = require("../middleware/tenant");
const asyncHandler = require("../middleware/async");
require("dotenv").config();

// Apply tenant context to all routes
router.use(protect);
router.use(setTenantContext);

// @desc    Get all users for tenant
// @route   GET /api/v1/users
// @access  Private/Admin
router.get(
  "/",
  authorize("admin", "superadmin"),
  tenantAuth,
  asyncHandler(async (req, res, next) => {
    // For superadmin, get all users if tenantId is provided
    let query;
    if (req.user.role === "superadmin" && req.query.tenantId) {
      query = User.find({ tenant: req.query.tenantId });
    } else {
      query = User.find({ tenant: req.user.tenant });
    }

    const users = await query.populate("tenant");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  })
);

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
router.get(
  "/:id",
  authorize("admin", "superadmin"),
  tenantAuth,
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).populate("tenant");

    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  })
);

// @desc    Create user (admin only)
// @route   POST /api/v1/users
// @access  Private/Admin
router.post(
  "/",
  authorize("admin", "superadmin"),
  tenantAuth,
  asyncHandler(async (req, res, next) => {
    // For superadmin, allow setting any tenant
    const tenant =
      req.user.role === "superadmin" && req.body.tenant
        ? req.body.tenant
        : req.user.tenant;

    const user = await User.create({
      ...req.body,
      tenant,
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  })
);

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
router.put(
  "/:id",
  authorize("admin", "superadmin"),
  tenantAuth,
  asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  })
);

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
router.delete(
  "/:id",
  authorize("admin", "superadmin"),
  tenantAuth,
  asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  })
);

module.exports = router;
