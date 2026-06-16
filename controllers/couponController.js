const Coupon = require("../models/Coupon");

// Get all coupons
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    const currentDate = new Date();

    res.render("admin/coupons/index", {
      title: "Quan Ly Ma Giam Gia",
      coupons,
      currentDate,
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.error("[restaurant] Error in getCoupons:", error);
    res.status(500).render("error", { error: error.message });
  }
};

// Get new coupon form
exports.getNewCouponForm = (req, res) => {
  res.render("admin/coupons/form", {
    title: "Them Ma Giam Gia Moi",
    coupon: null,
  });
};

// Create coupon
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxUsagePerUser,
      totalUsageLimit,
      expiryDate,
      applicableType,
      description,
    } = req.body;

    // Validate code uniqueness
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.redirect(
        `/admin/coupons/new?error=Ma giam gia ${code} da ton tai`
      );
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxUsagePerUser: Number(maxUsagePerUser) || 999,
      totalUsageLimit: Number(totalUsageLimit) || 9999,
      expiryDate: new Date(expiryDate),
      applicableType,
      description,
      isActive: true,
    });

    await coupon.save();
    res.redirect(`/admin/coupons?success=Them ma giam gia thanh cong`);
  } catch (error) {
    console.error("[restaurant] Error in createCoupon:", error);
    res.redirect(`/admin/coupons/new?error=${encodeURIComponent(error.message)}`);
  }
};

// Get edit coupon form
exports.getEditCouponForm = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.redirect("/admin/coupons?error=Khong tim thay ma giam gia");
    }

    res.render("admin/coupons/form", {
      title: "Chinh Sua Ma Giam Gia",
      coupon,
    });
  } catch (error) {
    console.error("[restaurant] Error in getEditCouponForm:", error);
    res.redirect("/admin/coupons?error=Co loi khi tai form");
  }
};

// Update coupon
exports.updateCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxUsagePerUser,
      totalUsageLimit,
      expiryDate,
      applicableType,
      description,
      isActive,
    } = req.body;

    // Check if code already exists (excluding current coupon)
    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase(),
      _id: { $ne: req.params.id },
    });

    if (existingCoupon) {
      return res.redirect(
        `/admin/coupons/${req.params.id}/edit?error=Ma giam gia ${code} da ton tai`
      );
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxUsagePerUser: Number(maxUsagePerUser) || 999,
        totalUsageLimit: Number(totalUsageLimit) || 9999,
        expiryDate: new Date(expiryDate),
        applicableType,
        description,
        isActive: isActive === "on",
      },
      { new: true }
    );

    if (!coupon) {
      return res.redirect("/admin/coupons?error=Khong tim thay ma giam gia");
    }

    res.redirect(`/admin/coupons?success=Cap nhat ma giam gia thanh cong`);
  } catch (error) {
    console.error("[restaurant] Error in updateCoupon:", error);
    res.redirect(
      `/admin/coupons/${req.params.id}/edit?error=${encodeURIComponent(error.message)}`
    );
  }
};

// Delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.redirect("/admin/coupons?error=Khong tim thay ma giam gia");
    }

    res.redirect(`/admin/coupons?success=Xoa ma giam gia thanh cong`);
  } catch (error) {
    console.error("[restaurant] Error in deleteCoupon:", error);
    res.redirect("/admin/coupons?error=Co loi khi xoa ma giam gia");
  }
};

// Validate coupon code (used at checkout)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code) {
      return res.json({ valid: false, message: "Vui long nhap ma giam gia" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.json({ valid: false, message: "Ma giam gia khong hop le" });
    }

    if (!coupon.isValid()) {
      return res.json({
        valid: false,
        message: "Ma giam gia da het han hoac dat gioi han su dung",
      });
    }

    if (orderTotal < coupon.minOrderAmount) {
      return res.json({
        valid: false,
        message: `Gia tri toi thieu don hang la ${coupon.minOrderAmount.toLocaleString(
          "vi-VN"
        )} dong`,
      });
    }

    // Calculate discount
    const discount =
      coupon.discountType === "percentage"
        ? Math.round((orderTotal * coupon.discountValue) / 100)
        : coupon.discountValue;

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
      finalAmount: orderTotal - discount,
      description: coupon.description,
    });
  } catch (error) {
    console.error("[restaurant] Error in validateCoupon:", error);
    res.json({ valid: false, message: "Co loi khi kiem tra ma giam gia" });
  }
};

module.exports = exports;
