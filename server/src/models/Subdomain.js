// models/Subdomain.js
const mongoose = require("mongoose");

const SubdomainSchema = new mongoose.Schema(
  {
    subdomain: {
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Subdomain", SubdomainSchema);
