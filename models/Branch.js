const mongoose = require("mongoose")

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: String,
  email: String,
  images: [String], // Multiple images for gallery
  image: String, // Main image
  openingHours: String,
  description: String,
  // Table management
  totalTables: { type: Number, default: 20 },
  availableTables: { type: Number, default: 20 },
  // Dishes available at this branch
  dishes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dish" }],
  // Branch-exclusive dishes (only available at this branch)
  specialDishes: [{
    dishId: { type: mongoose.Schema.Types.ObjectId, ref: "Dish" },
    quantity: { type: Number, default: 0 },
    available: { type: Boolean, default: true }
  }],
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Branch", branchSchema)
