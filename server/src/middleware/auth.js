// middleware/auth.js
const ErrorResponse = require("../lib/errorResponse");
const asyncHandler = require("./async");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// middleware/auth.js
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // 2. Get token from cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database and attach to request
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return next(new ErrorResponse("User no longer exists", 401));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Add this function
exports.setTenantContext = (req, res, next) => {
  // You can expand this logic if needed
  // For now, we assume `req.user.tenant` is already set in the `protect` middleware
  if (!req.user || !req.user.tenant) {
    return next(
      new ErrorResponse("Tenant context could not be established", 400)
    );
  }

  // Optionally set req.tenant or any other context
  req.tenant = req.user.tenant;
  next();
};
