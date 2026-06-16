const Review = require("../models/Review");
const Order = require("../models/Order");
const User = require("../models/User");
const Dish = require("../models/Dish");
const Product = require("../models/Product");

// Get all reviews (admin)
exports.getReviews = async (req, res) => {
  try {
    const statusFilter = req.query.status || "";
    const itemTypeFilter = req.query.itemType || "";
    const sortBy = req.query.sort || "createdAt";

    let query = {};

    if (statusFilter) {
      query.status = statusFilter;
    }

    if (itemTypeFilter) {
      query.itemType = itemTypeFilter;
    }

    const reviews = await Review.find(query)
      .populate("userId", "name email")
      .populate("itemId", "name")
      .sort({ [sortBy]: -1 });

    res.render("admin/reviews/index", {
      title: "Quan Ly Danh Gia",
      reviews,
      statusFilter,
      itemTypeFilter,
      sortBy,
      success: req.query.success,
    });
  } catch (error) {
    console.error("[restaurant] Error in getReviews:", error);
    res.status(500).render("error", { error: error.message });
  }
};

// Approve review
exports.approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        approvedBy: req.session.user.id,
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!review) {
      return res.redirect("/admin/reviews?error=Khong tim thay danh gia");
    }

    res.redirect("/admin/reviews?success=Phe duyet danh gia thanh cong");
  } catch (error) {
    console.error("[restaurant] Error in approveReview:", error);
    res.redirect("/admin/reviews?error=Co loi khi phe duyet");
  }
};

// Reject review
exports.rejectReview = async (req, res) => {
  try {
    const { reason } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        rejectReason: reason,
        rejectedBy: req.session.user.id,
        rejectedAt: new Date(),
      },
      { new: true }
    );

    if (!review) {
      return res.redirect("/admin/reviews?error=Khong tim thay danh gia");
    }

    res.redirect("/admin/reviews?success=Tu choi danh gia thanh cong");
  } catch (error) {
    console.error("[restaurant] Error in rejectReview:", error);
    res.redirect("/admin/reviews?error=Co loi khi tu choi");
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.redirect("/admin/reviews?error=Khong tim thay danh gia");
    }

    res.redirect("/admin/reviews?success=Xoa danh gia thanh cong");
  } catch (error) {
    console.error("[restaurant] Error in deleteReview:", error);
    res.redirect("/admin/reviews?error=Co loi khi xoa");
  }
};

// Submit review (customer)
exports.submitReview = async (req, res) => {
  try {
    const { itemId, itemType, rating, comment } = req.body;
    const userId = req.session.user.id;

    if (!itemId || !itemType || !rating) {
      return res.status(400).json({ error: "Thong tin danh gia khong du" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Danh gia phai tu 1 den 5 sao" });
    }

    // Check if user has purchased this item
    let query = {
      userId,
      status: "completed",
      "items.itemType": itemType,
    };

    if (itemType === "dish") {
      query["items.dishId"] = itemId;
    } else {
      query["items.productId"] = itemId;
    }

    const hasOrdered = await Order.findOne(query);

    if (!hasOrdered) {
      return res.status(403).json({ error: "Ban can phai mua san pham nay de danh gia" });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      userId,
      itemId,
      itemType,
    });

    if (existingReview) {
      return res.status(400).json({ error: "Ban da danh gia san pham nay roi" });
    }

    const review = new Review({
      userId,
      itemId,
      itemType,
      rating: Number(rating),
      comment: comment || "",
      isVerifiedPurchase: true,
      status: "pending",
    });

    await review.save();

    res.json({
      success: true,
      message: "Danh gia se duoc kiem duyet trong 24 gio",
    });
  } catch (error) {
    console.error("[restaurant] Error in submitReview:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get reviews for an item (public)
exports.getItemReviews = async (req, res) => {
  try {
    const { itemId, itemType } = req.params;

    const reviews = await Review.find({
      itemId,
      itemType,
      status: "approved",
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) /
            reviews.length
          ).toFixed(1)
        : 0;

    const ratingDistribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    res.json({
      reviews,
      avgRating,
      totalReviews: reviews.length,
      ratingDistribution,
    });
  } catch (error) {
    console.error("[restaurant] Error in getItemReviews:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
