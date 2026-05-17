const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  productType: { type: String, required: true }, // e.g., "beverage", "snack", "merchandise", etc.
  discount: { type: Number, default: 0 },
  available: { type: Boolean, default: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  
  // Inventory management - global quantity only (no branch-specific for products)
  quantity: { type: Number, default: 0 },
  
  // Order history tracking
  totalOrdersCompleted: { type: Number, default: 0 },
  
  // HOT product tracking - manual and automatic
  // isHot: Can be set manually by admin OR automatically when totalOrdersCompleted >= 100
  isHot: { type: Boolean, default: false },
  isAutoHot: { type: Boolean, default: false }, // Flag to indicate auto-promotion (vs manual)
  
  // Best-selling tracking (same 24-hour expiration as dishes)
  isBestSelling: { type: Boolean, default: false },
  bestSellingPromotedAt: { type: Date, default: null },
  
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Product", productSchema)
