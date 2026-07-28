const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/orderController");

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

router.get("/", checkAdmin, orderController.getOrders);
router.get("/:id", checkAdmin, orderController.getOrderDetail);
router.post("/:id/status", checkAdmin, orderController.updateOrderStatus);
router.post("/:id/complete-cod", checkAdmin, orderController.completeCODPayment);
router.post("/:id/assign-shipper", checkAdmin, orderController.assignToShipper);
router.post("/:id/auto-assign-shipper", checkAdmin, orderController.autoAssignToShipper);
router.post("/:id/assign-staff", checkAdmin, orderController.assignToStaff);
router.post("/:id/auto-assign-staff", checkAdmin, orderController.autoAssignToStaff);
router.post("/:id/cancel", checkAdmin, orderController.cancelOrder);

module.exports = router;
