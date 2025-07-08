// routes/subscriptions.js
const express = require("express");
const router = express.Router();
const Subscription = require("../models/Subscription");
const Taxpayer = require("../models/Taxpayer");
// const { sendEmail } = require("../services/emailService"); // Assume email service exists

// routes/subscriptions.js
router.post("/", async (req, res) => {
  try {
    const { subscription, taxpayer, planType = "trial", amount = 0 } = req.body;

    // Validate input
    if (!subscription || !taxpayer) {
      return res.status(400).json({
        success: false,
        message: "Subscription and taxpayer are required",
      });
    }

    // For trial subscriptions, force amount to 0
    const finalAmount = planType === "trial" ? 0 : amount;

    // Create new subscription
    const newSubscription = new Subscription({
      subscription,
      taxpayer,
      planType,
      amount: finalAmount,
      paidAt: planType === "trial" ? null : new Date(),
      // endsAt will be auto-calculated in pre-save hook
    });

    await newSubscription.save();

    res.status(201).json({
      success: true,
      data: newSubscription,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Subscription already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
});

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
router.post("/:id/convert", async (req, res) => {
  try {
    const { planType, amount, paymentMethod } = req.body;
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    if (subscription.planType !== "trial") {
      return res.status(400).json({
        success: false,
        message: "Only trial subscriptions can be converted",
      });
    }

    if (!planType || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Plan type, amount and payment method are required",
      });
    }

    subscription.planType = planType;
    subscription.amount = amount;
    subscription.paymentMethod = paymentMethod;
    subscription.paidAt = new Date();
    subscription.trialConverted = true;

    await subscription.save();

    res.json({
      success: true,
      data: subscription,
      message: "Trial converted to paid subscription",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
});

// Upgrade/downgrade subscription plan
router.post("/:id/change-plan", async (req, res) => {
  try {
    const { newPlanType, proratedAmount } = req.body;
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    if (subscription.planType === "trial") {
      return res.status(400).json({
        success: false,
        message: "Trial subscriptions must be converted first",
      });
    }

    if (!newPlanType) {
      return res.status(400).json({
        success: false,
        message: "New plan type is required",
      });
    }

    // Calculate prorated credit and new end date
    const daysRemaining = subscription.daysRemaining();
    const dailyRate =
      subscription.amount /
      (subscription.planType === "monthly"
        ? 30
        : subscription.planType === "quarterly"
        ? 90
        : 365);
    const credit = daysRemaining * dailyRate;

    subscription.planType = newPlanType;
    subscription.amount = proratedAmount || calculatePlanAmount(newPlanType); // Implement this function
    subscription.paidAt = new Date();
    subscription.renewalCount += 1;

    await subscription.save();

    res.json({
      success: true,
      data: subscription,
      message: "Subscription plan changed successfully",
      creditApplied: credit,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
});

// Subscription analytics
router.get("/analytics/:taxpayerId", async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      taxpayer: req.params.taxpayerId,
    });

    const analytics = {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter(
        (s) => s.isActive && !s.isExpired()
      ).length,
      trialSubscriptions: subscriptions.filter((s) => s.planType === "trial")
        .length,
      totalRevenue: subscriptions.reduce(
        (sum, sub) => sum + (sub.amount || 0),
        0
      ),
      planDistribution: subscriptions.reduce((acc, sub) => {
        acc[sub.planType] = (acc[sub.planType] || 0) + 1;
        return acc;
      }, {}),
      renewalRate:
        subscriptions.length > 0
          ? subscriptions.filter((s) => s.renewalCount > 0).length /
            subscriptions.length
          : 0,
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
});

// Webhook for payment processing
router.post("/webhook/payment", async (req, res) => {
  try {
    const { subscriptionId, paymentSuccess, paymentDate } = req.body;

    if (!subscriptionId || paymentSuccess === undefined) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook data",
      });
    }

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    if (paymentSuccess) {
      subscription.paidAt = paymentDate || new Date();
      subscription.isActive = true;
      await subscription.save();

      // Send payment confirmation email
      const taxpayer = await Taxpayer.findById(subscription.taxpayer);
      await sendEmail({
        to: taxpayer.email,
        subject: "Payment received",
        text: `Your payment for ${subscription.planType} subscription has been processed.`,
      });
    } else {
      subscription.isActive = false;
      await subscription.save();

      // Send payment failure email
      const taxpayer = await Taxpayer.findById(subscription.taxpayer);
      await sendEmail({
        to: taxpayer.email,
        subject: "Payment failed",
        text: "We couldn't process your payment. Please update your payment method.",
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
});

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
router.get("/taxpayer/:taxpayerId/active", async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      taxpayer: req.params.taxpayerId,
      isActive: true,
      endsAt: { $gt: new Date() }, // Only subscriptions that haven't expired
    });
    res.json({
      success: true,
      data: subscriptions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
});

// Get subscription by ID
router.get("/:id", async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }
    res.json({
      success: true,
      data: subscription,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
});

// Renew subscription
router.post("/:id/renew", async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Update paidAt to now and endsAt will be recalculated
    subscription.paidAt = new Date();
    subscription.isActive = true;
    await subscription.save();

    res.json({
      success: true,
      data: subscription,
      message: "Subscription renewed successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
});

// Cancel subscription
router.post("/:id/cancel", async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    res.json({
      success: true,
      data: subscription,
      message: "Subscription cancelled successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
});

// Get all subscriptions (with filters)
router.get("/", async (req, res) => {
  try {
    const { taxpayer, planType, active } = req.query;
    const filter = {};

    if (taxpayer) filter.taxpayer = taxpayer;
    if (planType) filter.planType = planType;
    if (active === "true") {
      filter.isActive = true;
      filter.endsAt = { $gt: new Date() };
    } else if (active === "false") {
      filter.$or = [{ isActive: false }, { endsAt: { $lte: new Date() } }];
    }

    const subscriptions = await Subscription.find(filter);
    res.json({
      success: true,
      data: subscriptions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
});

module.exports = router;
