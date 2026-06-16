const mongoose = require("mongoose")

const qaSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  dishId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dish"
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: String,
  answeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  answeredAt: Date,
  helpful: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["pending", "answered"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("QA", qaSchema)
