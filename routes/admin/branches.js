const express = require("express");
const router = express.Router();
const branchController = require("../../controllers/branchController");

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

router.get("/", checkAdmin, branchController.getBranches);
router.get("/new", checkAdmin, branchController.getNewBranchForm);
router.post("/", checkAdmin, branchController.createBranch);
router.get("/:id/edit", checkAdmin, branchController.getEditBranchForm);
router.post("/:id", checkAdmin, branchController.updateBranch);
router.get("/:id/delete", checkAdmin, branchController.deleteBranch);

router.post("/:id/add-table", checkAdmin, branchController.addTable);
router.post("/:id/remove-table", checkAdmin, branchController.removeTable);

module.exports = router;
