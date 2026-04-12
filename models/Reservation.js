const mongoose = require("mongoose")

const reservationSchema = new mongoose.Schema({
  // userId is optional — walkin_assist bookings may not have a registered account
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  date: { type: Date, required: true },
  time: String,
  guests: { type: Number, required: true },
  specialRequests: String,
  orderItems: [{
    dishId: { type: mongoose.Schema.Types.ObjectId, ref: "Dish" },
    name: String,
    quantity: Number,
    price: Number,
    discount: { type: Number, default: 0 }
  }],
  depositAmount: { type: Number, default: 100000 }, // Fixed deposit for table
  foodTotal: { type: Number, default: 0 }, // Total food price
  foodDiscount: { type: Number, default: 0 }, // Total food discount
  totalAmount: { type: Number, default: 0 }, // deposit + food after discount
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  // Booking type: "online" = customer booked themselves; "walkin_assist" = reception booked on behalf of guest
  bookingType: { type: String, enum: ["online", "walkin_assist"], default: "online" },
  // Guest info for walkin_assist bookings (no registered account required)
  guestName: { type: String, default: "" },
  guestPhone: { type: String, default: "" },
  guestEmail: { type: String, default: "" },
  // Staff who created the walkin_assist booking
  bookedByStaff: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "paid", "processing", "completed", "cancelled"], 
    default: "pending" 
  },
  paymentStatus: { type: String, enum: ["unpaid", "partial", "paid"], default: "unpaid" },
  paymentMethod: String,
  paidAt: Date,
  rating: { type: Number, min: 1, max: 5 },
  ratingComment: String,
  ratedAt: Date,
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Reservation", reservationSchema)
