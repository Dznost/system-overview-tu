const mongoose = require("mongoose")

const dishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  category: { type: String, enum: ["appetizer", "main", "dessert", "beverage"], required: true },
  discount: { type: Number, default: 0 },
  available: { type: Boolean, default: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  
  // Inventory management - global quantity
  quantity: { type: Number, default: 0 },
  
  // Branch-level inventory: [{ branchId, quantity }]
  branchInventory: [{
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
    quantity: { type: Number, default: 0 }
  }],
  
  // Order history tracking
  totalOrdersCompleted: { type: Number, default: 0 },
  
  // Best-selling tracking
  isBestSelling: { type: Boolean, default: false },
  bestSellingPromotedAt: { type: Date, default: null },
  
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Dish", dishSchema)
