// models/Subscription.js
import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    subscription: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[a-z0-9-]+$/,
      index: true,
    },
    taxpayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Taxpayer",
      required: true,
    },
    planType: {
      type: String,
      required: true,
      enum: ["trial", "monthly", "quarterly", "yearly"],
      default: "trial",
    },
    paidAt: {
      type: Date,
      required: function () {
        return this.planType !== "trial";
      },
    },
    startsAt: {
      type: Date,
      default: Date.now,
    },
    endsAt: {
      type: Date,
      required: function () {
        return this.planType !== "trial";
      }, // Only required for non-trial
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    amount: {
      type: Number,
      required: function () {
        return this.planType !== "trial";
      },
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "bank_transfer", "paypal", null],
      default: null,
    },
    trialConverted: {
      type: Boolean,
      default: false,
    },
    renewalCount: {
      type: Number,
      default: 0,
    },
    nextBillingDate: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook for subscription logic
SubscriptionSchema.pre("save", function (next) {
  // Set trial period (14 days)
  if (this.planType === "trial" && !this.endsAt) {
    this.endsAt = new Date(this.startsAt.getTime() + 14 * 24 * 60 * 60 * 1000);
    this.amount = 0;
  }

  // Calculate endsAt for paid plans
  if (this.planType !== "trial" && !this.endsAt && this.paidAt) {
    const durationMap = {
      monthly: 30 * 24 * 60 * 60 * 1000,
      quarterly: 90 * 24 * 60 * 60 * 1000,
      yearly: 365 * 24 * 60 * 60 * 1000,
    };
    this.endsAt = new Date(this.paidAt.getTime() + durationMap[this.planType]);
  }

  // Set next billing date (7 days before expiration)
  if (this.planType !== "trial" && this.endsAt) {
    this.nextBillingDate = new Date(
      this.endsAt.getTime() - 7 * 24 * 60 * 60 * 1000
    );
  }

  next();
});

// Method to check if subscription is expired
SubscriptionSchema.methods.isExpired = function () {
  return this.endsAt < new Date();
};

// Method to calculate days remaining
SubscriptionSchema.methods.daysRemaining = function () {
  return Math.ceil((this.endsAt - new Date()) / (1000 * 60 * 60 * 24));
};

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

export default Subscription;
