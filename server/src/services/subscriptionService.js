// services/subscriptionService.js
const Subscription = require("../models/Subscription");
const { sendEmail } = require("./emailService");

// Check for expiring subscriptions and send reminders
async function checkExpiringSubscriptions() {
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const expiringSubs = await Subscription.find({
    endsAt: { $lte: sevenDaysFromNow },
    isActive: true,
  }).populate("taxpayer");

  for (const sub of expiringSubs) {
    await sendEmail({
      to: sub.taxpayer.email,
      subject: "Your subscription is expiring soon",
      text: `Your ${sub.planType} subscription expires on ${sub.endsAt}. Renew now to avoid interruption.`,
    });
  }
}

// Process subscription renewals
async function processRenewals() {
  const expiringSubs = await Subscription.find({
    endsAt: { $lte: new Date() },
    isActive: true,
    planType: { $ne: "trial" },
  });

  for (const sub of expiringSubs) {
    // In a real app, this would interface with your payment processor
    console.log(`Processing renewal for subscription ${sub._id}`);
    // Mark as inactive if payment fails
    sub.isActive = false;
    await sub.save();
  }
}

module.exports = {
  checkExpiringSubscriptions,
  processRenewals,
};
