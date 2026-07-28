const express = require("express");
const router = express.Router();
const warrantyController = require("../../controllers/warrantyController");

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

router.get("/", checkAdmin, warrantyController.getWarranties);
router.post("/:id/claim", checkAdmin, warrantyController.claimWarranty);
router.post("/:id/resolve", checkAdmin, warrantyController.resolveWarranty);
router.post("/:id/requests/:requestId", checkAdmin, warrantyController.updateRequest);
router.get("/:id/delete", checkAdmin, warrantyController.deleteWarranty);

module.exports = router;
