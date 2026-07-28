const express = require("express");
const router = express.Router();
const qaController = require("../../controllers/qaController");

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

router.get("/", checkAdmin, qaController.getQA);
router.post("/:id/answer", checkAdmin, qaController.answerQuestion);
router.get("/:id/delete", checkAdmin, qaController.deleteQuestion);

module.exports = router;
