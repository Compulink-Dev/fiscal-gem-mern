// jobs/subscriptionJobs.js
const cron = require("node-cron");
const {
  checkExpiringSubscriptions,
  processRenewals,
} = require("../services/subscriptionService");

// Run daily at 9 AM
cron.schedule("0 9 * * *", () => {
  console.log("Running subscription expiration checks...");
  checkExpiringSubscriptions();
});

// Run hourly
cron.schedule("0 * * * *", () => {
  console.log("Processing subscription renewals...");
  processRenewals();
});
