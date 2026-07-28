const express = require("express");
const router = express.Router();
const couponController = require("../../controllers/couponController");

// Middleware to check admin
const checkAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect("/auth/login?error=Vui+lòng+đăng+nhập");
  }
  if (req.session.user.role !== "admin") {
    return res.status(403).render("error", { error: "Bạn không có quyền truy cập", layout: false });
  }
  next();
};

router.get("/", checkAdmin, couponController.getCoupons);
router.get("/new", checkAdmin, couponController.getNewCouponForm);
router.post("/", checkAdmin, couponController.createCoupon);
router.get("/:id/edit", checkAdmin, couponController.getEditCouponForm);
router.post("/:id", checkAdmin, couponController.updateCoupon);
router.get("/:id/delete", checkAdmin, couponController.deleteCoupon);
router.post("/:id/delete", checkAdmin, couponController.deleteCoupon);

module.exports = router;
