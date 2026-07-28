const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
      default: () => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    userName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    messages: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true
        },
        senderType: {
          type: String,
          enum: ["user", "admin"],
          required: true
        },
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        senderName: {
          type: String,
          required: true
        },
        content: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        },
        isRead: {
          type: Boolean,
          default: false
        }
      }
    ],
    lastMessage: {
      type: String
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
      index: true
    },
    lastMessageSender: {
      type: String,
      enum: ["user", "admin"]
    },
    isResolved: {
      type: Boolean,
      default: false
    },
    resolvedAt: {
      type: Date
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    subject: {
      type: String
    },
    unreadCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Index for efficient queries
messageSchema.index({ conversationId: 1, userId: 1 });
messageSchema.index({ userId: 1, lastMessageTime: -1 });
messageSchema.index({ isResolved: 1, lastMessageTime: -1 });

module.exports = mongoose.model("Message", messageSchema);
