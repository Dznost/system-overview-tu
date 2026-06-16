const express = require("express");
const router = express.Router();
const warrantyController = require("../../controllers/warrantyController");

// Middleware to check admin
const checkAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.redirect("/login");
  }
  next();
};

router.get("/", checkAdmin, warrantyController.getWarranties);
router.post("/:id/claim", checkAdmin, warrantyController.claimWarranty);
router.post("/:id/resolve", checkAdmin, warrantyController.resolveWarranty);
router.get("/:id/delete", checkAdmin, warrantyController.deleteWarranty);

module.exports = router;
