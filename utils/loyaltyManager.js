const User = require("../models/User")

// Calculate loyalty points earned from order amount
function calculatePointsFromOrder(orderAmount) {
  // 1 point = 1,000 VND spent
  return Math.floor(orderAmount / 1000)
}

// Update user tier based on totalSpent
async function updateUserTier(userId) {
  try {
    const user = await User.findById(userId)
    if (!user) return null
    
    user.calculateTier()
    await user.save()
    
    return user.customerTier
  } catch (error) {
    console.error("[restaurant] Error updating user tier:", error)
    throw error
  }
}

// Add loyalty points to user
async function addLoyaltyPoints(userId, points, description = "") {
  try {
    const user = await User.findById(userId)
    if (!user) throw new Error("User not found")
    
    user.loyaltyPoints = (user.loyaltyPoints || 0) + points
    
    console.log(`[restaurant] Added ${points} points to user ${userId}. Total: ${user.loyaltyPoints}`)
    
    await user.save()
    return user.loyaltyPoints
  } catch (error) {
    console.error("[restaurant] Error adding loyalty points:", error)
    throw error
  }
}

// Subtract loyalty points from user
async function subtractLoyaltyPoints(userId, points, description = "") {
  try {
    const user = await User.findById(userId)
    if (!user) throw new Error("User not found")
    
    if (user.loyaltyPoints < points) {
      throw new Error("Insufficient loyalty points")
    }
    
    user.loyaltyPoints = user.loyaltyPoints - points
    
    console.log(`[restaurant] Subtracted ${points} points from user ${userId}. Remaining: ${user.loyaltyPoints}`)
    
    await user.save()
    return user.loyaltyPoints
  } catch (error) {
    console.error("[restaurant] Error subtracting loyalty points:", error)
    throw error
  }
}

// Update user spending and calculate tier
async function updateUserSpending(userId, amount) {
  try {
    const user = await User.findById(userId)
    if (!user) throw new Error("User not found")
    
    user.totalSpent = (user.totalSpent || 0) + amount
    user.lastOrderDate = new Date()
    
    // Calculate new tier
    user.calculateTier()
    
    console.log(`[restaurant] Updated spending for user ${userId}. Total spent: ${user.totalSpent}. New tier: ${user.customerTier}`)
    
    await user.save()
    return user
  } catch (error) {
    console.error("[restaurant] Error updating user spending:", error)
    throw error
  }
}

// Get tier benefits (discount percentage)
function getTierBenefits(tier) {
  const benefits = {
    guest: {
      discount: 0,
      description: "Mới đăng ký"
    },
    loyal: {
      discount: 0,
      description: "Có ít nhất 1 đơn hàng hoặc 100,000đ"
    },
    silver: {
      discount: 5,
      description: "500,000đ trở lên - 5% giảm giá"
    },
    gold: {
      discount: 7,
      description: "2,000,000đ trở lên - 7% giảm giá"
    },
    platinum: {
      discount: 10,
      description: "5,000,000đ trở lên - 10% giảm giá"
    }
  }
  
  return benefits[tier] || benefits.guest
}

// Check if user can use loyalty points
function canUseLoyaltyPoints(user, pointsToUse) {
  return user.loyaltyPoints >= pointsToUse
}

module.exports = {
  calculatePointsFromOrder,
  updateUserTier,
  addLoyaltyPoints,
  subtractLoyaltyPoints,
  updateUserSpending,
  getTierBenefits,
  canUseLoyaltyPoints
}
