const mongoose = require("mongoose")

// A customer request to move wallet money back to their bank account.
// The wallet is only debited when an admin ticks the "already transferred" box.
const refundRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  amount: { type: Number, required: true, min: 1 },
  bankName: { type: String, required: true },
  bankCode: { type: String, default: "" }, // VietQR bank code used to build the QR image
  accountNumber: { type: String, required: true },
  accountHolder: { type: String, required: true },
  note: { type: String, maxlength: 300, default: "" },
  status: { type: String, enum: ["pending", "completed", "rejected"], default: "pending", index: true },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  processedAt: { type: Date, default: null },
  rejectReason: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("RefundRequest", refundRequestSchema)
