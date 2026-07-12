const express = require("express");
const router = express.Router();
const reviewController = require("../../controllers/reviewController");

// Middleware to check admin
const checkAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.redirect("/login");
  }
  next();
};

router.get("/", checkAdmin, reviewController.getReviews);
router.post("/:id/approve", checkAdmin, reviewController.approveReview);
router.post("/:id/reject", checkAdmin, reviewController.rejectReview);
router.get("/:id/delete", checkAdmin, reviewController.deleteReview);
router.post("/:id/reply", checkAdmin, reviewController.replyToReview);

module.exports = router;
