const Message = require("../models/Message");
const User = require("../models/User");

// Get user's conversations
exports.getUserMessages = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/auth/login?error=Vui+lòng+đăng+nhập");
    }
    const userId = req.session.user._id;
    
    const conversations = await Message.find({ userId })
      .sort({ lastMessageTime: -1 })
      .select("conversationId userName userEmail subject lastMessage lastMessageTime isResolved messages");

    res.render("user/messages/index", {
      title: "Hỏi Đáp",
      currentPage: "messages",
      conversations,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.redirect("/user/profile");
  }
};

// Send message from user
exports.sendUserMessage = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/auth/login?error=Vui+lòng+đăng+nhập");
    }
    const userId = req.session.user._id;
    const { subject, content, conversationId } = req.body;

    if (!content || !content.trim()) {
      return res.redirect("/user/messages?error=Vui+lòng+nhập+nội+dung+tin+nhắn");
    }

    const user = await User.findById(userId).select("name email");

    let conversation;

    if (conversationId) {
      // Reply to existing conversation
      conversation = await Message.findOneAndUpdate(
        { conversationId },
        {
          $push: {
            messages: {
              senderType: "user",
              senderId: userId,
              senderName: user.name,
              content: content.trim(),
              createdAt: new Date()
            }
          },
          lastMessage: content.trim(),
          lastMessageTime: new Date(),
          lastMessageSender: "user",
          isResolved: false
        },
        { new: true }
      );
    } else {
      // Create new conversation
      const newConversation = new Message({
        userId,
        userName: user.name,
        userEmail: user.email,
        subject: subject || "Tin nhắn mới",
        messages: [
          {
            senderType: "user",
            senderId: userId,
            senderName: user.name,
            content: content.trim(),
            createdAt: new Date()
          }
        ],
        lastMessage: content.trim(),
        lastMessageTime: new Date(),
        lastMessageSender: "user"
      });

      conversation = await newConversation.save();
    }

    res.redirect(`/user/messages/${conversation.conversationId}?success=Gửi+tin+nhắn+thành+công`);
  } catch (error) {
    console.error(error);
    res.redirect("/user/messages?error=Gửi+thất+bại");
  }
};

// Get single conversation
exports.getUserConversation = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/auth/login?error=Vui+lòng+đăng+nhập");
    }
    const userId = req.session.user._id;
    const { conversationId } = req.params;

    const conversation = await Message.findOne({
      conversationId,
      userId
    });

    if (!conversation) {
      return res.redirect("/user/messages?error=Không+tìm+thấy+cuộc+hội+thoại");
    }

    // Mark as read for user
    conversation.messages.forEach(msg => {
      if (msg.senderType === "admin" && !msg.isRead) {
        msg.isRead = true;
      }
    });
    await conversation.save();

    res.render("user/messages/detail", {
      title: "Hỏi Đáp",
      currentPage: "messages",
      conversation,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.redirect("/user/messages?error=Lỗi+tải+cuộc+hội+thoại");
  }
};

// ========== ADMIN FUNCTIONS ==========

// Get all conversations (Q&A page)
exports.getAdminMessages = async (req, res) => {
  try {
    const { filter } = req.query;
    const filterType = filter || "all";

    let query = {};
    if (filterType === "unread") {
      query.unreadCount = { $gt: 0 };
    } else if (filterType === "resolved") {
      query.isResolved = true;
    } else if (filterType === "pending") {
      query.isResolved = false;
    }

    const conversations = await Message.find(query)
      .sort({ lastMessageTime: -1 })
      .select("conversationId userId userName userEmail subject lastMessage lastMessageTime isResolved unreadCount")
      .populate("userId", "name email phone");

    res.render("admin/messages-qa/index", {
      title: "Quản Lý Q&A - Hỏi Đáp",
      currentPage: "messages-qa",
      conversations,
      filterType,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.redirect("/admin");
  }
};

// Get conversation detail for admin
exports.getAdminConversationDetail = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Message.findOne({ conversationId })
      .populate("userId", "name email phone");

    if (!conversation) {
      return res.redirect("/admin/messages-qa?error=Không+tìm+thấy+cuộc+hội+thoại");
    }

    // Mark admin messages as read
    conversation.unreadCount = 0;
    conversation.messages.forEach(msg => {
      if (msg.senderType === "admin") {
        msg.isRead = true;
      }
    });
    await conversation.save();

    res.render("admin/messages-qa/detail", {
      title: "Chi Tiết Cuộc Hội Thoại",
      currentPage: "messages-qa",
      conversation,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error(error);
    res.redirect("/admin/messages-qa?error=Lỗi+tải+chi+tiết");
  }
};

// Reply to conversation (admin)
exports.replyToConversation = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/auth/login?error=Vui+lòng+đăng+nhập");
    }
    const { conversationId } = req.params;
    const { content } = req.body;
    const adminId = req.session.user._id;

    if (!content || !content.trim()) {
      return res.redirect(`/admin/messages-qa/${conversationId}?error=Vui+lòng+nhập+nội+dung+phản+hồi`);
    }

    const admin = await User.findById(adminId).select("name");

    const conversation = await Message.findOneAndUpdate(
      { conversationId },
      {
        $push: {
          messages: {
            senderType: "admin",
            senderId: adminId,
            senderName: admin.name,
            content: content.trim(),
            createdAt: new Date(),
            isRead: false
          }
        },
        lastMessage: content.trim(),
        lastMessageTime: new Date(),
        lastMessageSender: "admin"
      },
      { new: true }
    );

    res.redirect(`/admin/messages-qa/${conversationId}?success=Phản+hồi+thành+công`);
  } catch (error) {
    console.error(error);
    res.redirect("/admin/messages-qa?error=Phản+hồi+thất+bại");
  }
};

// Resolve conversation
exports.resolveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const adminId = req.session.user._id;

    await Message.findOneAndUpdate(
      { conversationId },
      {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: adminId
      }
    );

    res.redirect(`/admin/messages-qa?success=Đánh+dấu+cuộc+hội+thoại+là+hoàn+thành`);
  } catch (error) {
    console.error(error);
    res.redirect("/admin/messages-qa?error=Lỗi+khi+hoàn+thành");
  }
};

// Unresolve conversation
exports.unresolveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.findOneAndUpdate(
      { conversationId },
      {
        isResolved: false,
        resolvedAt: null,
        resolvedBy: null
      }
    );

    res.redirect(`/admin/messages-qa?success=Cuộc+hội+thoại+đã+được+mở+lại`);
  } catch (error) {
    console.error(error);
    res.redirect("/admin/messages-qa?error=Lỗi+khi+mở+lại");
  }
};

// Delete conversation
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.deleteOne({ conversationId });

    res.redirect("/admin/messages-qa?success=Xoá+cuộc+hội+thoại+thành+công");
  } catch (error) {
    console.error(error);
    res.redirect("/admin/messages-qa?error=Xoá+thất+bại");
  }
};
