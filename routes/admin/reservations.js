const express = require("express");
const router = express.Router();
const reservationController = require("../../controllers/reservationController");

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

router.get("/", checkAdmin, reservationController.getReservations);
router.get("/:id", checkAdmin, reservationController.getReservationDetail);
router.post("/:id/status", checkAdmin, reservationController.updateReservationStatus);

module.exports = router;
