// routes/subscriptions.js
import express from "express";

import {
  createSubscription,
  convertTrialToPaid,
  changeSubscription,
  subscriptionAnalytics,
  paymentWebhook,
  getTaxPayerSubscription,
  getSubscriptionById,
  renewSubscription,
  cancelSubscription,
  getSubscriptions,
} from "../controllers/subscriptionControllers.js";
// const { sendEmail } = require("../services/emailService"); // Assume email service exists

const router = express.Router();

// routes/subscriptions.js
router.post("/", createSubscription);

// // Create subscription with trial support
// router.post("/", async (req, res) => {
//   try {
//     const {
//       subscription,
//       taxpayer,
//       planType = "trial",
//       amount = 0,
//       paymentMethod,
//     } = req.body;

//     // Validate
//     if (!subscription || !taxpayer) {
//       return res.status(400).json({
//         success: false,
//         message: "Subscription and taxpayer are required",
//       });
//     }

//     // Check taxpayer exists
//     const taxpayerExists = await Taxpayer.findById(taxpayer);
//     if (!taxpayerExists) {
//       return res.status(404).json({
//         success: false,
//         message: "Taxpayer not found",
//       });
//     }

//     // For paid plans, validate payment details
//     if (planType !== "trial") {
//       if (!amount || amount <= 0 || !paymentMethod) {
//         return res.status(400).json({
//           success: false,
//           message: "Amount and payment method are required for paid plans",
//         });
//       }
//     }

//     const newSubscription = new Subscription({
//       subscription,
//       taxpayer,
//       planType,
//       amount,
//       paymentMethod,
//       paidAt: planType === "trial" ? null : new Date(),
//     });

//     await newSubscription.save();

//     // // Send welcome email
//     // await sendEmail({
//     //   to: taxpayerExists.email,
//     //   subject: `Your ${planType} subscription is active`,
//     //   text: `Thank you for subscribing! Your subscription will expire on ${newSubscription.endsAt}.`,
//     // });

//     res.status(201).json({
//       success: true,
//       data: newSubscription,
//     });
//   } catch (err) {
//     if (err.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Subscription already exists",
//       });
//     }
//     res.status(500).json({
//       success: false,
//       message: err.message || "Server error",
//     });
//   }
// });

// Convert trial to paid subscription
router.post("/:id/convert", convertTrialToPaid);

// Upgrade/downgrade subscription plan
router.post("/:id/change-plan", changeSubscription);

// Subscription analytics
router.get("/analytics/:taxpayerId", subscriptionAnalytics);

// Webhook for payment processing
router.post("/webhook/payment", paymentWebhook);

// Create subscription
// router.post("/", async (req, res) => {
//   try {
//     const { subscription, taxpayer, planType, amount, paidAt } = req.body;

//     // Validate input
//     if (!subscription || !taxpayer || !planType || !amount) {
//       return res.status(400).json({
//         success: false,
//         message: "Subscription, taxpayer, planType and amount are required",
//       });
//     }

//     // Check if taxpayer exists
//     const taxpayerExists = await Taxpayer.findById(taxpayer);
//     if (!taxpayerExists) {
//       return res.status(404).json({
//         success: false,
//         message: "Taxpayer not found",
//       });
//     }

//     // Create new subscription
//     const newSubscription = new Subscription({
//       subscription,
//       taxpayer,
//       planType,
//       amount,
//       paidAt: paidAt || new Date(),
//       // endsAt will be auto-calculated in pre-save hook
//     });

//     await newSubscription.save();

//     res.status(201).json({
//       success: true,
//       data: newSubscription,
//     });
//   } catch (err) {
//     if (err.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Subscription already exists",
//       });
//     }
//     res.status(500).json({
//       success: false,
//       message: err.message || "Server error",
//     });
//   }
// });

// Get all active subscriptions for a taxpayer
router.get("/taxpayer/:taxpayerId/active", getTaxPayerSubscription);

// Get subscription by ID
router.get("/:id", getSubscriptionById);

// Renew subscription
router.post("/:id/renew", renewSubscription);

// Cancel subscription
router.post("/:id/cancel", cancelSubscription);

// Get all subscriptions (with filters)
router.get("/", getSubscriptions);

export default router;
