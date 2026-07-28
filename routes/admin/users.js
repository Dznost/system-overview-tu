const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");

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

router.get("/", checkAdmin, userController.getUsers);
router.get("/:id", checkAdmin, userController.getUserDetail);
router.post("/:id/change-password", checkAdmin, userController.changeUserPassword);
router.post("/:id/change-role", checkAdmin, userController.changeUserRole);
router.post("/:id/approve-branch-change", checkAdmin, userController.approveBranchChange);
router.post("/:id/reject-branch-change", checkAdmin, userController.rejectBranchChange);
router.post("/:id/set-branch", checkAdmin, userController.setShipperBranch);
router.get("/:id/delete", checkAdmin, userController.deleteUser);

module.exports = router;
