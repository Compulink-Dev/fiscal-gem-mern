// middleware/tenant.js
const ErrorResponse = require("../lib/errorResponse");
const asyncHandler = require("./async");
const User = require("../models/User");

// @desc    Check if user belongs to tenant
// @route   ALL
// @access  Private
exports.tenantAuth = asyncHandler(async (req, res, next) => {
  // Skip for superadmin
  if (req.user.role === "superadmin") {
    return next();
  }

  // Check if route has tenant ID param
  const tenantId = req.params.tenantId || req.body.tenant || req.query.tenant;

  if (!tenantId) {
    return next(
      new ErrorResponse("Tenant ID is required for this request", 400)
    );
  }

  // Verify user belongs to tenant
  if (req.user.tenant.toString() !== tenantId.toString()) {
    return next(new ErrorResponse("Not authorized to access this tenant", 403));
  }

  next();
});

// @desc    Set tenant context for all requests
// @route   ALL
// @access  Private
exports.setTenantContext = asyncHandler(async (req, res, next) => {
  if (req.user) {
    req.tenant = req.user.tenant;
  }
  next();
});
