const express = require("express");
const router = express.Router();
const dishController = require("../../controllers/dishController");

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

router.get("/", checkAdmin, dishController.getDishes);
router.get("/new", checkAdmin, dishController.getNewDishForm);
router.post("/", checkAdmin, dishController.createDish);
router.get("/:id/edit", checkAdmin, dishController.getEditDishForm);
router.post("/:id", checkAdmin, dishController.updateDish);
router.get("/:id/delete", checkAdmin, dishController.deleteDish);

module.exports = router;
