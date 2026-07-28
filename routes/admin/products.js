const express = require("express");
const router = express.Router();
const productController = require("../../controllers/productController");

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

router.get("/", checkAdmin, productController.getProducts);
router.get("/new", checkAdmin, productController.getNewProductForm);
router.post("/", checkAdmin, productController.createProduct);
router.get("/:id/edit", checkAdmin, productController.getEditProductForm);
router.post("/:id", checkAdmin, productController.updateProduct);
router.get("/:id/delete", checkAdmin, productController.deleteProduct);

module.exports = router;
