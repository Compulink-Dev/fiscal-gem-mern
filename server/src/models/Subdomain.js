// models/Subdomain.js
import mongoose from "mongoose";

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

const Subdomain = mongoose.model("Subdomain", SubdomainSchema);

export default Subdomain;
