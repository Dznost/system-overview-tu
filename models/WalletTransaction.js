const mongoose = require("mongoose")

// Ledger of every movement in a customer wallet. `balanceAfter` is stored so the
// history stays auditable even if the running balance on the user is recomputed.
const walletTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  direction: { type: String, enum: ["credit", "debit"], required: true },
  type: {
    type: String,
    enum: [
      "order_refund", // order was cancelled, money returned to wallet
      "order_payment", // wallet used to pay for an order
      "withdraw_payout", // admin transferred money back to the customer bank account
      "admin_adjustment",
    ],
    required: true,
  },
  amount: { type: Number, required: true, min: 0 },
  balanceAfter: { type: Number, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  refundRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "RefundRequest", default: null },
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
})

walletTransactionSchema.index({ userId: 1, createdAt: -1 })

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema)
