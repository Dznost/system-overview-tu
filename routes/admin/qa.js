const express = require("express");
const router = express.Router();
const qaController = require("../../controllers/qaController");

// Middleware to check admin
const checkAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.redirect("/login");
  }
  next();
};

router.get("/", checkAdmin, qaController.getQA);
router.post("/:id/answer", checkAdmin, qaController.answerQuestion);
router.get("/:id/delete", checkAdmin, qaController.deleteQuestion);

module.exports = router;
