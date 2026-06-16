const Review = require("../models/Review");
const Order = require("../models/Order");

// Helper: build item filter from itemId + itemType
function itemFilter(itemId, itemType) {
  return itemType === "dish" ? { dishId: itemId } : { productId: itemId };
}

// Get all reviews (admin)
exports.getReviews = async (req, res) => {
  try {
    const statusFilter = req.query.status || "";
    const itemTypeFilter = req.query.itemType || "";

    const query = {};
    if (statusFilter) query.status = statusFilter;
    if (itemTypeFilter === "dish") query.dishId = { $ne: null };
    if (itemTypeFilter === "product") query.productId = { $ne: null };

    const reviews = await Review.find(query)
      .populate("userId", "name email")
      .populate("productId", "name")
      .populate("dishId", "name")
      .sort({ createdAt: -1 });

    const stats = {
      total: await Review.countDocuments(),
      pending: await Review.countDocuments({ status: "pending" }),
      approved: await Review.countDocuments({ status: "approved" }),
      rejected: await Review.countDocuments({ status: "rejected" }),
    };

    res.render("admin/reviews/index", {
      title: "Quan Ly Danh Gia San Pham",
      reviews,
      stats,
      statusFilter,
      itemTypeFilter,
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.error("[restaurant] Error in getReviews:", error);
    res.status(500).render("error", { error: error.message, layout: false });
  }
};

// Approve review
exports.approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: "approved", updatedAt: new Date() },
      { new: true }
    );
    if (!review) return res.redirect("/admin/reviews?error=Khong tim thay danh gia");
    res.redirect("/admin/reviews?success=Phe duyet danh gia thanh cong");
  } catch (error) {
    console.error("[restaurant] Error in approveReview:", error);
    res.redirect("/admin/reviews?error=Co loi khi phe duyet");
  }
};

// Reject review
exports.rejectReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", updatedAt: new Date() },
      { new: true }
    );
    if (!review) return res.redirect("/admin/reviews?error=Khong tim thay danh gia");
    res.redirect("/admin/reviews?success=Tu choi danh gia thanh cong");
  } catch (error) {
    console.error("[restaurant] Error in rejectReview:", error);
    res.redirect("/admin/reviews?error=Co loi khi tu choi");
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.redirect("/admin/reviews?success=Xoa danh gia thanh cong");
  } catch (error) {
    console.error("[restaurant] Error in deleteReview:", error);
    res.redirect("/admin/reviews?error=Co loi khi xoa");
  }
};

// Submit review (customer)
exports.submitReview = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Vui long dang nhap de danh gia" });
    }
    const { itemId, itemType, rating, comment } = req.body;
    const userId = req.session.user.id;

    if (!itemId || !itemType || !rating) {
      return res.status(400).json({ error: "Thong tin danh gia khong du" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Danh gia phai tu 1 den 5 sao" });
    }

    // Check if user has purchased this item (verified purchase)
    const purchaseQuery = { userId, status: "completed" };
    if (itemType === "dish") purchaseQuery["items.dishId"] = itemId;
    else purchaseQuery["items.productId"] = itemId;

    const matchedOrder = await Order.findOne(purchaseQuery);

    // Prevent duplicate review for same item
    const existing = await Review.findOne({ userId, ...itemFilter(itemId, itemType) });
    if (existing) {
      return res.status(400).json({ error: "Ban da danh gia san pham nay roi" });
    }

    const review = new Review({
      userId,
      orderId: matchedOrder ? matchedOrder._id : undefined,
      ...itemFilter(itemId, itemType),
      rating: Number(rating),
      comment: comment || "",
      verifiedPurchase: !!matchedOrder,
      status: "pending",
    });
    await review.save();

    res.json({ success: true, message: "Danh gia se duoc kiem duyet truoc khi hien thi" });
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
      ...itemFilter(itemId, itemType),
      status: "approved",
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const ratingDistribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    res.json({ reviews, avgRating, totalReviews: reviews.length, ratingDistribution });
  } catch (error) {
    console.error("[restaurant] Error in getItemReviews:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
