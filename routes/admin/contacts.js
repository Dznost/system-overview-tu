const express = require("express");
const router = express.Router();
const contactController = require("../../controllers/contactController");

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

router.get("/", checkAdmin, contactController.getContacts);
router.get("/:id", checkAdmin, contactController.getContactDetail);
router.post("/:id/reply", checkAdmin, contactController.replyContact);
router.post("/:id/approve-shipper", checkAdmin, contactController.approveShipperApplication);
router.post("/:id/reject-shipper", checkAdmin, contactController.rejectShipperApplication);
router.post("/:id/approve-staff", checkAdmin, contactController.approveStaffApplication);
router.post("/:id/reject-staff", checkAdmin, contactController.rejectStaffApplication);
router.get("/:id/delete", checkAdmin, contactController.deleteContact);

module.exports = router;
