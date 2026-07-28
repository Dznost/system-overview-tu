const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      // Order activities
      "new_order",
      "large_order",
      "order_assigned",
      "order_confirmed",
      "order_shipping",
      "order_completed",
      "order_cancelled",
      "order_review",
      "walkin_order",
      // Guest order activities (đặt hộ khách)
      "guest_order",
      "guest_order_assigned",
      "guest_order_processing",
      "guest_order_completed",
      "guest_order_cancelled",
      // Reservation activities
      "new_reservation",
      "large_reservation",
      "reservation_assigned",
      "reservation_confirmed",
      "reservation_completed",
      "reservation_cancelled",
      "reservation_review",
      // Payment activities
      "payment_received",
      "payment_failed",
      // Wallet & refund activities
      "wallet_refund",
      "refund_request",
      "refund_completed",
      "refund_rejected",
      // User activities
      "new_user_registration",
      "shipper_application",
      "staff_application",
      "reception_application",
      "branch_change_request",
      "role_change",
      // Branch activities
      "branch_low_tables",
      "branch_full",
      "branch_revenue_milestone",
      // System
      "general",
      "system_alert",
    ],
    required: true,
  },
  category: {
    type: String,
    enum: ["order", "reservation", "payment", "user", "branch", "system"],
    default: "system",
  },
  priority: {
    type: String,
    enum: ["low", "normal", "high", "urgent"],
    default: "normal",
  },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  reservationId: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, default: 0 },
  message: { type: String, required: true },
  details: { type: String },
  userNote: String,
  status: { type: String, enum: ["pending", "read", "resolved"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Notification", notificationSchema)
