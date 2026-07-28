const express = require("express");
const router = express.Router();
const messageController = require("../../controllers/messageController");

// Middleware to check admin
const checkAdmin = (req, res, next) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.redirect("/login");
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
