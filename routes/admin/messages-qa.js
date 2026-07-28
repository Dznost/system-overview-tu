const express = require("express");
const router = express.Router();
const messageController = require("../../controllers/messageController");

// Middleware to check admin
const checkAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect("/auth/login?error=Vui+lòng+đăng+nhập");
  }
  if (!req.session.user.isAdmin) {
    return res.status(403).render("error", { 
      error: "Bạn không có quyền truy cập",
      layout: false 
    });
  }
  next();
};

// Get all conversations
router.get("/", checkAdmin, messageController.getAdminMessages);

// Get conversation detail
router.get("/:conversationId", checkAdmin, messageController.getAdminConversationDetail);

// Reply to conversation
router.post("/:conversationId/reply", checkAdmin, messageController.replyToConversation);

// Resolve conversation
router.get("/:conversationId/resolve", checkAdmin, messageController.resolveConversation);

// Unresolve conversation
router.get("/:conversationId/unresolve", checkAdmin, messageController.unresolveConversation);

// Delete conversation
router.get("/:conversationId/delete", checkAdmin, messageController.deleteConversation);

module.exports = router;
