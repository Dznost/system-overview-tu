const express = require("express");
const router = express.Router();
const productController = require("../../controllers/productController");

// Middleware to check admin
const checkAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.redirect("/login");
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
