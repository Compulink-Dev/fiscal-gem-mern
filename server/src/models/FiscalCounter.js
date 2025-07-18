const mongoose = require("mongoose");

const FiscalCounterSchema = new mongoose.Schema(
  {
    deviceID: {
      type: Number,
      required: true,
    },
    fiscalCounterType: {
      type: String,
      enum: [
        "SaleByTax",
        "SaleTaxByTax",
        "BalanceByMoneyType",
        "CreditNoteByTax",
        "CreditNoteTaxByTax",
      ],
      required: true,
    },
    fiscalCounterCurrency: {
      type: String,
      required: true,
    },
    fiscalCounterTaxPercent: Number,
    fiscalCounterTaxID: Number,
    fiscalCounterMoneyType: String,
    fiscalCounterValue: {
      type: Number,
      required: true,
    },
    fiscalCounterTaxAmountValue: Number,
    fiscalDayNo: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FiscalCounter", FiscalCounterSchema);
