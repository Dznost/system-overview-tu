const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { return !this.socialProvider; } },
  phone: String,
  address: String,
  secondaryAddress: String,
  avatar: String,
  role: { type: String, enum: ["user", "admin", "shipper", "staff", "reception"], default: "user" },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  pendingBranchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  branchChangeStatus: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
  
  // Social login fields
  socialProvider: { type: String, enum: ["google", "facebook", null], default: null },
  socialId: { type: String, default: null },
  googleId: { type: String, default: null },
  facebookId: { type: String, default: null },
  
  // Loyalty program fields
  loyaltyPoints: { type: Number, default: 0 },
  customerTier: { 
    type: String, 
    enum: ["guest", "loyal", "silver", "gold", "platinum"], 
    default: "guest" 
  },
  totalSpent: { type: Number, default: 0 },
  lastOrderDate: { type: Date, default: null },
  isVerified: { type: Boolean, default: false },
  
  // Banking information for debt tracking
  bankInfo: {
    accountNumber: String,
    bankName: String,
    accountHolder: String
  },
  
  // Personal information
  dateOfBirth: { type: Date, default: null },
  
  createdAt: { type: Date, default: Date.now },
})

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

// Calculate customer tier based on totalSpent
userSchema.methods.calculateTier = function () {
  const spent = this.totalSpent || 0
  
  if (spent >= 5000000) {
    this.customerTier = "platinum"
  } else if (spent >= 2000000) {
    this.customerTier = "gold"
  } else if (spent >= 500000) {
    this.customerTier = "silver"
  } else if (spent >= 100000 || this.totalOrdersCompleted > 0) {
    this.customerTier = "loyal"
  } else {
    this.customerTier = "guest"
  }
  
  return this.customerTier
}

// Get tier discount percentage
userSchema.methods.getTierDiscount = function () {
  const discounts = {
    guest: 0,
    loyal: 0,
    silver: 5,
    gold: 7,
    platinum: 10
  }
  return discounts[this.customerTier] || 0
}

module.exports = mongoose.model("User", userSchema)
