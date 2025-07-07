const mongoose = require("mongoose");

const TaxpayerSchema = new mongoose.Schema(
  {
    deviceID: {
      type: Number,
      required: true,
    },
    tin: { type: String, required: true, unique: true, length: 10 },
    name: { type: String, required: true, maxlength: 250 },
    vatNumber: { type: String, maxlength: 9 },
    address: {
      province: { type: String, required: true, maxlength: 100 },
      city: { type: String, required: true, maxlength: 100 },
      street: { type: String, required: true, maxlength: 100 },
      houseNo: { type: String, required: true, maxlength: 100 },
    },
    contacts: {
      phoneNo: { type: String, maxlength: 20 },
      email: { type: String, maxlength: 100 },
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

// Check if model already exists before creating it
module.exports = mongoose.model("Taxpayer", TaxpayerSchema);
