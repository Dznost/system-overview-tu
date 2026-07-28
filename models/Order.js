const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  orderCode: { type: String, unique: true, sparse: true, index: true },
  customerPhoneNormalized: { type: String, index: true, default: null },
  isGuestCheckout: { type: Boolean, default: false },
  items: [
    {
      dishId: { type: mongoose.Schema.Types.ObjectId, ref: "Dish" },
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      itemType: { type: String, enum: ["dish", "product"], default: "dish" },
      name: String,
      quantity: Number,
      price: Number,
      discount: Number,
    },
  ],
  orderType: { type: String, enum: ["dine-in", "takeaway"], required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  guests: Number,
  // Track if order was placed by user or receptionist on behalf of guest
  orderFor: { type: String, enum: ["customer", "reception_behalf"], default: "customer" },
  // Guest info for reception_behalf orders
  guestName: { type: String, default: "" },
  guestPhone: { type: String, default: "" },
  guestEmail: { type: String, default: "" },
  depositAmount: { type: Number, default: 0 }, // 100k for reception_behalf orders
  minBookingTime: { type: Date }, // Minimum booking time (must be 2+ hours from now)
  paymentTiming: { type: String, enum: ["prepaid", "cod"], default: "prepaid" },
  totalPrice: Number,
  discount: { type: Number, default: 0 },
  finalPrice: Number,
  shipperId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  // Staff member who created this order on behalf of a guest (for reception_behalf orders)
  createdByStaff: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  // Detailed status tracking
  status: { 
    type: String, 
    enum: [
      // Shared
      "pending_approval", "approved", "cancelled",
      // Delivery-specific
      "assigned_shipper", "shipped", "delivery_failed", "delivered_success",
      // Dine-in specific
      "confirmed", "preparing", "ready", "served",
      // Payment
      "payment_pending", "payment_completed", "payment_failed"
    ], 
    default: "pending_approval" 
  },
  paymentStatus: { type: String, enum: ["unpaid", "paid", "partial", "debt"], default: "unpaid" },
  paymentMethod: String,
  collectionStatus: { type: String, enum: ["not_collected", "pending_collection", "collected"], default: "not_collected" },
  
  // Approval workflow
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: Date,
  
  // Shipper assignment
  assignedShipperId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedAt: Date,
  deliveryAttempts: [{
    attemptNumber: Number,
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ["success", "failed", "rescheduled"] },
    reason: String
  }],
  
  // Coupon and loyalty
  couponCode: String,
  couponDiscount: { type: Number, default: 0 },
  loyaltyPointsEarned: { type: Number, default: 0 },
  loyaltyPointsUsed: { type: Number, default: 0 },
  loyaltyAwarded: { type: Boolean, default: false },
  
  // Delivery and customer info
  deliveryAddress: String,
  fullName: String,
  email: String,
  phone: String,
  specialRequests: String,
  paidAt: Date,
  adminNotified: { type: Boolean, default: false },
  largeOrderNote: String, // Special request from user for orders > 100M
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  confirmedAt: Date,
  shippingAt: Date,
  deliveredAt: Date,
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    actorRole: { type: String, default: "system" },
    actorName: { type: String, default: "Hệ thống" },
    note: { type: String, maxlength: 500, default: "" },
  }],
  // Cancellation & refund tracking
  cancelledAt: Date,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  cancelledByRole: { type: String, default: "" },
  cancelReason: { type: String, maxlength: 500, default: "" },
  refundedAmount: { type: Number, default: 0 },
  refundedToWalletAt: { type: Date, default: null },
  // Amount of this order that was settled using wallet balance
  walletAmountUsed: { type: Number, default: 0 },

  rating: { type: Number, min: 1, max: 5 },
  ratingComment: String,
  ratedAt: Date,
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Order", orderSchema)
