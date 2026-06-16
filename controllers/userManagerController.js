const User = require("../models/User");
const Order = require("../models/Order");
const loyaltyManager = require("../utils/loyaltyManager");

// Get all users with loyalty info
exports.getUsers = async (req, res) => {
  try {
    const searchQuery = req.query.q || "";
    const tierFilter = req.query.tier || "";
    const verifiedFilter = req.query.verified || "";

    let query = {};

    if (tierFilter) {
      query.customerTier = tierFilter;
    }

    if (verifiedFilter) {
      query.isVerified = verifiedFilter === "yes";
    }

    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
        { phone: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("name email phone customerTier loyaltyPoints totalSpent isVerified createdAt")
      .sort({ totalSpent: -1 });

    res.render("admin/users/index", {
      title: "Quan Ly Khach Hang",
      users,
      searchQuery,
      tierFilter,
      verifiedFilter,
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.error("[restaurant] Error in getUsers:", error);
    res.status(500).render("error", { error: error.message });
  }
};

// Get user detail
exports.getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.redirect("/admin/users?error=Khong tim thay khach hang");
    }

    // Get user's orders
    const orders = await Order.find({ userId: user._id })
      .select("status totalPrice finalPrice createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    const totalOrders = await Order.countDocuments({ userId: user._id });
    const totalSpentOrders = await Order.aggregate([
      { $match: { userId: user._id, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$finalPrice" } } },
    ]);

    const tierBenefits = loyaltyManager.getTierBenefits(user.customerTier);

    res.render("admin/users/detail", {
      title: `Chi Tiet Khach Hang: ${user.name}`,
      user,
      orders,
      totalOrders,
      actualSpent: totalSpentOrders[0]?.total || 0,
      tierBenefits,
    });
  } catch (error) {
    console.error("[restaurant] Error in getUserDetail:", error);
    res.redirect("/admin/users?error=Co loi khi tai chi tiet");
  }
};

// Adjust loyalty points
exports.adjustLoyaltyPoints = async (req, res) => {
  try {
    const { pointsChange, reason } = req.body;
    const pointsAmount = Number(pointsChange);

    if (!pointsAmount || isNaN(pointsAmount)) {
      return res.redirect(
        `/admin/users/${req.params.id}?error=So diem khong hop le`
      );
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.redirect("/admin/users?error=Khong tim thay khach hang");
    }

    const oldPoints = user.loyaltyPoints;

    if (pointsAmount > 0) {
      await loyaltyManager.addLoyaltyPoints(user._id, pointsAmount);
    } else if (pointsAmount < 0) {
      await loyaltyManager.subtractLoyaltyPoints(user._id, Math.abs(pointsAmount));
    }

    user.loyaltyPoints = user.loyaltyPoints + pointsAmount;

    console.log(`[restaurant] Adjusted loyalty points for ${user.name}: ${oldPoints} -> ${user.loyaltyPoints}`);

    res.redirect(`/admin/users/${req.params.id}?success=Cap nhat diem thanh cong`);
  } catch (error) {
    console.error("[restaurant] Error in adjustLoyaltyPoints:", error);
    res.redirect(`/admin/users/${req.params.id}?error=${encodeURIComponent(error.message)}`);
  }
};

// Update customer tier manually
exports.updateCustomerTier = async (req, res) => {
  try {
    const { tier } = req.body;
    const validTiers = ["guest", "loyal", "silver", "gold", "platinum"];

    if (!validTiers.includes(tier)) {
      return res.redirect(`/admin/users/${req.params.id}?error=Tier khong hop le`);
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.redirect("/admin/users?error=Khong tim thay khach hang");
    }

    const oldTier = user.customerTier;
    user.customerTier = tier;
    await user.save();

    console.log(`[restaurant] Updated tier for ${user.name}: ${oldTier} -> ${tier}`);

    res.redirect(`/admin/users/${req.params.id}?success=Cap nhat tier thanh cong`);
  } catch (error) {
    console.error("[restaurant] Error in updateCustomerTier:", error);
    res.redirect(`/admin/users/${req.params.id}?error=${encodeURIComponent(error.message)}`);
  }
};

// Verify user email
exports.verifyUserEmail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.redirect("/admin/users?error=Khong tim thay khach hang");
    }

    user.isVerified = true;
    await user.save();

    res.redirect(`/admin/users/${req.params.id}?success=Xac nhan email thanh cong`);
  } catch (error) {
    console.error("[restaurant] Error in verifyUserEmail:", error);
    res.redirect(`/admin/users/${req.params.id}?error=Co loi khi xac nhan`);
  }
};

// Get loyalty report
exports.getLoyaltyReport = async (req, res) => {
  try {
    // Get stats by tier
    const tierStats = await User.aggregate([
      {
        $group: {
          _id: "$customerTier",
          count: { $sum: 1 },
          totalSpent: { $sum: "$totalSpent" },
          avgSpent: { $avg: "$totalSpent" },
          totalPoints: { $sum: "$loyaltyPoints" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get top customers
    const topCustomers = await User.find()
      .select("name email phone totalSpent customerTier loyaltyPoints createdAt")
      .sort({ totalSpent: -1 })
      .limit(20);

    // Get recent members
    const recentMembers = await User.find({ role: "user" })
      .select("name email phone customerTier createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    // Total users
    const totalUsers = await User.countDocuments({ role: "user" });
    const verifiedUsers = await User.countDocuments({ role: "user", isVerified: true });

    res.render("admin/reports/loyalty", {
      title: "Bao Cao Chuong Trinh Loyalty",
      tierStats,
      topCustomers,
      recentMembers,
      totalUsers,
      verifiedUsers,
      verificationRate: Math.round((verifiedUsers / totalUsers) * 100),
    });
  } catch (error) {
    console.error("[restaurant] Error in getLoyaltyReport:", error);
    res.status(500).render("error", { error: error.message });
  }
};

module.exports = exports;
