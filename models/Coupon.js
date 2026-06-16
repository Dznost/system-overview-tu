const mongoose = require("mongoose")

const couponSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true
  },
  description: String,
  discountType: { 
    type: String, 
    enum: ["percentage", "fixed_amount"],
    required: true
  },
  discountValue: { 
    type: Number, 
    required: true,
    min: 0
  },
  minOrderAmount: { 
    type: Number, 
    default: 0 
  },
  maxUses: { 
    type: Number, 
    default: -1 // -1 means unlimited
  },
  usedCount: { 
    type: Number, 
    default: 0 
  },
  validFrom: { 
    type: Date, 
    required: true 
  },
  validUntil: { 
    type: Date, 
    required: true 
  },
  applicableTo: {
    type: [String],
    enum: ["dishes", "products", "all"],
    default: ["all"]
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
})

// Check if coupon is still valid
couponSchema.methods.isValid = function() {
  const now = new Date()
  const isExpired = now > this.validUntil || now < this.validFrom
  const isExhausted = this.maxUses !== -1 && this.usedCount >= this.maxUses
  return !isExpired && !isExhausted && this.isActive
}

module.exports = mongoose.model("Coupon", couponSchema)
