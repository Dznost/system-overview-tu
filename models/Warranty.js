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
    required: true
  },
  warrantyPeriodMonths: {
    type: Number,
    required: true
  },
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
