const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
  status: { 
    type: String, 
    enum: ["pending", "approved", "paid", "processing", "shipping", "delivered", "completed", "cancelled"], 
    default: "pending" 
  },
  paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
  paymentMethod: String,
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
  rating: { type: Number, min: 1, max: 5 },
  ratingComment: String,
  ratedAt: Date,
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Order", orderSchema)
