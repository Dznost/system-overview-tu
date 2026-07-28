const express = require("express");
const router = express.Router();
const blogController = require("../../controllers/blogController");

// Middleware to check admin
const checkAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect("/auth/login?error=Vui+lòng+đăng+nhập");
  }
  if (req.session.user.role !== "admin") {
    return res.status(403).render("error", { 
      error: "Bạn không có quyền truy cập",
      layout: false 
    });
  }
  next();
};

router.get("/", checkAdmin, blogController.getBlogs);
router.get("/new", checkAdmin, blogController.getNewBlogForm);
router.post("/", checkAdmin, blogController.createBlog);
router.get("/:id/edit", checkAdmin, blogController.getEditBlogForm);
router.post("/:id", checkAdmin, blogController.updateBlog);
router.get("/:id/delete", checkAdmin, blogController.deleteBlog);

module.exports = router;
