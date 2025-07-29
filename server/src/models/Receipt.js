import mongoose from "mongoose";

const ReceiptSchema = new mongoose.Schema(
  {
    // models/Receipt.js
    deviceID: {
      type: Number, // Keep as Number to match Device model
      required: true,
    },
    receiptType: {
      type: String,
      enum: ["FiscalInvoice", "CreditNote", "DebitNote"],
      required: true,
    },
    receiptCurrency: {
      type: String,
      required: true,
    },
    receiptCounter: {
      type: Number,
      required: true,
    },
    receiptGlobalNo: {
      type: Number,
      required: true,
    },
    receiptNotes: String,
    invoiceNo: {
      type: String,
      required: true,
    },
    buyerData: mongoose.Schema.Types.Mixed,
    receiptDate: {
      type: Date,
      default: Date.now,
    },
    receiptLinesTaxInclusive: Boolean,
    receiptLines: [
      {
        receiptLineType: String,
        receiptLineNo: Number,
        receiptLineHSCode: String,
        receiptLineName: String,
        receiptLinePrice: Number,
        receiptLineQuantity: Number,
        receiptLineTotal: Number,
        taxCode: String,
        taxPercent: Number,
        taxID: Number,
      },
    ],
    receiptTaxes: [
      {
        taxCode: String,
        taxID: Number,
        taxPercent: Number,
        taxAmount: Number,
        salesAmountWithTax: Number,
      },
    ],
    receiptPayments: [
      {
        moneyTypeCode: String,
        paymentAmount: Number,
      },
    ],
    receiptTotal: Number,
    receiptPrintForm: String,
    receiptDeviceSignature: {
      hash: String,
      signature: String,
    },
    creditDebitNote: {
      receiptID: String,
      receiptGlobalNo: Number,
      fiscalDayNo: Number,
    },
    fiscalDayNo: Number,
  },
  { timestamps: true }
);

const Receipt = mongoose.model("Receipt", ReceiptSchema);

export default Receipt;
