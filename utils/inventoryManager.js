const Dish = require("../models/Dish");

/**
 * Decrement dish quantity when item is added to cart/order
 * @param {ObjectId} dishId - ID of the dish
 * @param {ObjectId} branchId - ID of the branch (optional, for branch-specific quantity)
 * @param {number} quantity - Amount to decrement
 * @returns {Promise<Object>} Updated dish object
 */
exports.decrementQuantity = async (dishId, branchId = null, quantity = 1) => {
  try {
    let updateQuery = {};
    let decrementAmount = quantity;

    if (branchId) {
      // Decrement branch-specific quantity
      const dish = await Dish.findById(dishId);
      if (!dish) {
        throw new Error("Dish not found");
      }

      // Find or create branch inventory entry
      let branchInv = dish.branchInventory.find(
        (inv) => inv.branchId.toString() === branchId.toString()
      );

      if (!branchInv) {
        dish.branchInventory.push({ branchId, quantity: 0 });
        branchInv = dish.branchInventory[dish.branchInventory.length - 1];
      }

      // Ensure we don't go below 0
      const newQuantity = Math.max(0, branchInv.quantity - decrementAmount);
      branchInv.quantity = newQuantity;

      // Also decrement global quantity
      dish.quantity = Math.max(0, dish.quantity - decrementAmount);

      await dish.save();
      return dish;
    } else {
      // Decrement global quantity only
      const dish = await Dish.findByIdAndUpdate(
        dishId,
        { $inc: { quantity: -decrementAmount } },
        { new: true }
      );
      return dish;
    }
  } catch (error) {
    console.error("[restaurant] Error in decrementQuantity:", error);
    throw error;
  }
};

/**
 * Increment dish quantity when order is cancelled
 * @param {ObjectId} dishId - ID of the dish
 * @param {ObjectId} branchId - ID of the branch (optional)
 * @param {number} quantity - Amount to increment
 * @returns {Promise<Object>} Updated dish object
 */
exports.incrementQuantity = async (dishId, branchId = null, quantity = 1) => {
  try {
    if (branchId) {
      const dish = await Dish.findById(dishId);
      if (!dish) {
        throw new Error("Dish not found");
      }

      let branchInv = dish.branchInventory.find(
        (inv) => inv.branchId.toString() === branchId.toString()
      );

      if (!branchInv) {
        dish.branchInventory.push({ branchId, quantity });
      } else {
        branchInv.quantity += quantity;
      }

      // Also increment global quantity
      dish.quantity += quantity;

      await dish.save();
      return dish;
    } else {
      const dish = await Dish.findByIdAndUpdate(
        dishId,
        { $inc: { quantity } },
        { new: true }
      );
      return dish;
    }
  } catch (error) {
    console.error("[restaurant] Error in incrementQuantity:", error);
    throw error;
  }
};

/**
 * Increment order count when order is completed
 * @param {ObjectId} dishId - ID of the dish
 * @returns {Promise<Object>} Updated dish object
 */
exports.incrementOrderCount = async (dishId) => {
  try {
    const dish = await Dish.findByIdAndUpdate(
      dishId,
      { $inc: { totalOrdersCompleted: 1 } },
      { new: true }
    );

    // Check if should be promoted to best-selling (>= 20 completed orders)
    if (dish.totalOrdersCompleted >= 20 && !dish.isBestSelling) {
      await Dish.findByIdAndUpdate(dishId, {
        isBestSelling: true,
        bestSellingPromotedAt: new Date(),
      });
      console.log("[restaurant] Dish promoted to best-selling:", dishId);
    }

    return dish;
  } catch (error) {
    console.error("[restaurant] Error in incrementOrderCount:", error);
    throw error;
  }
};

/**
 * Check and demote best-selling dishes if 24 hours have passed
 * Should be called periodically (e.g., via cron job)
 * @returns {Promise<Array>} Array of demoted dish IDs
 */
exports.checkBestSellingExpiration = async () => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const demotedDishes = await Dish.updateMany(
      {
        isBestSelling: true,
        bestSellingPromotedAt: { $lt: twentyFourHoursAgo },
      },
      {
        isBestSelling: false,
        bestSellingPromotedAt: null,
      }
    );

    if (demotedDishes.modifiedCount > 0) {
      console.log(
        "[restaurant] Demoted",
        demotedDishes.modifiedCount,
        "dishes from best-selling"
      );
    }

    return demotedDishes;
  } catch (error) {
    console.error("[restaurant] Error in checkBestSellingExpiration:", error);
    throw error;
  }
};

/**
 * Get dishes by branch with inventory info
 * @param {ObjectId} branchId - ID of the branch
 * @param {Object} filters - Additional filters (category, available, etc)
 * @returns {Promise<Array>} Array of dishes with branch inventory
 */
exports.getDishesByBranch = async (branchId, filters = {}) => {
  try {
    const query = { ...filters };
    const dishes = await Dish.find(query);

    // Enrich with branch-specific inventory
    return dishes.map((dish) => {
      const dishObj = dish.toObject();
      const branchInv = dish.branchInventory.find(
        (inv) => inv.branchId.toString() === branchId.toString()
      );
      dishObj.branchQuantity = branchInv ? branchInv.quantity : 0;
      dishObj.isOutOfStock = dishObj.branchQuantity === 0;
      return dishObj;
    });
  } catch (error) {
    console.error("[restaurant] Error in getDishesByBranch:", error);
    throw error;
  }
};

/**
 * Get best-selling dishes
 * @returns {Promise<Array>} Array of best-selling dishes
 */
exports.getBestSellingDishes = async () => {
  try {
    return await Dish.find({ isBestSelling: true }).sort({ totalOrdersCompleted: -1 });
  } catch (error) {
    console.error("[restaurant] Error in getBestSellingDishes:", error);
    throw error;
  }
};
