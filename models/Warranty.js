const mongoose = require("mongoose")

const warrantySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  warrantyCode: { type: String, required: true, unique: true, index: true, trim: true, uppercase: true },
  orderItemIndex: { type: Number, required: true, default: 0 },
  unitIndex: { type: Number, required: true, default: 0 },
  customerName: { type: String, trim: true },
  customerPhone: { type: String, required: true, trim: true },
  warrantyPeriodMonths: {
    type: Number,
    required: true
  },
  requestCount: { type: Number, default: 0 },
  requests: [{
    issueDescription: { type: String, required: true, trim: true, maxlength: 2000 },
    serviceAddress: { type: String, required: true, trim: true, maxlength: 500 },
    requestedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["pending", "contacted", "in_progress", "resolved", "rejected"], default: "pending" },
    adminNotes: { type: String, trim: true, maxlength: 2000 },
    resolvedAt: Date
  }],
  issueDescription: String,
  status: {
    type: String,
    enum: ["active", "claimed", "expired", "resolved"],
    default: "active"
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  claimedAt: Date,
  resolvedAt: Date,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Calculate end date based on warranty period
warrantySchema.pre("save", function(next) {
  if (!this.endDate && this.startDate && this.warrantyPeriodMonths) {
    const endDate = new Date(this.startDate)
    endDate.setMonth(endDate.getMonth() + this.warrantyPeriodMonths)
    this.endDate = endDate
  }
  next()
})

// Check if warranty is still active
warrantySchema.methods.isActive = function() {
  const now = new Date()
  return this.status === "active" && now <= this.endDate
}

module.exports = mongoose.model("Warranty", warrantySchema)
