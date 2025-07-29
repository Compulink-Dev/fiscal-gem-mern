import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema(
  {
    deviceID: {
      type: Number,
      required: true,
      unique: true,
    },
    activationKey: {
      type: String,
      required: true,
    },
    serialNo: {
      type: String,
      required: true,
    },
    taxpayerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Taxpayer",
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
    certificate: String,
    publicKey: String,
    privateKey: String,
    operationID: String,
    fiscalDayStatus: {
      type: String,
      enum: ["FiscalDayOpened", "FiscalDayClosed", "FiscalDayCloseFailed"],
      default: "FiscalDayClosed",
    },
    fiscalDayClosed: Boolean,
    lastReceiptGlobalNo: {
      type: Number,
      default: 0,
    },
    lastReceiptCounter: {
      type: Number,
      default: 0,
    },
    previousReceiptHash: String,
    lastFiscalDayNo: {
      type: Number,
      default: 0,
    },
    fiscalDayOpenedAt: Date,
    operatingMode: {
      type: String,
      enum: ["ONLINE", "OFFLINE"],
      default: "ONLINE",
    },
    deviceBranchContacts: {
      phoneNumber: String,
      email: String,
    },
    vatNumber: String,
    applicableTaxes: [
      {
        taxID: Number,
        taxCode: String,
        taxPercent: Number,
        taxName: String,
      },
    ],
    certificateValidTill: Date,
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Device = mongoose.model("Device", DeviceSchema);

export default Device;
