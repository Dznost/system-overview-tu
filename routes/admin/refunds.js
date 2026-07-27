const express = require("express")
const router = express.Router()
const RefundRequest = require("../../models/RefundRequest")
const WalletTransaction = require("../../models/WalletTransaction")
const Order = require("../../models/Order")
const User = require("../../models/User")
const Notification = require("../../models/Notification")
const walletManager = require("../../utils/walletManager")

const checkAdmin = (req, res, next) => {
  if (!req.session.user) {
    req.session.returnTo = req.originalUrl
    return res.redirect("/login")
  }
  if (req.session.user.role !== "admin") {
    return res.status(403).render("error", {
      error: "Ban khong co quyen truy cap trang nay. Chi admin moi co the truy cap.",
      layout: false,
    })
  }
  next()
}

// Refund dashboard: pending payout requests + cancelled orders that were refunded
router.get("/", checkAdmin, async (req, res) => {
  try {
    const statusFilter = ["pending", "completed", "rejected"].includes(req.query.status)
      ? req.query.status
      : "all"

    const query = statusFilter === "all" ? {} : { status: statusFilter }

    const [requests, counts, cancelledOrders] = await Promise.all([
      RefundRequest.find(query)
        .populate("userId", "name email phone walletBalance")
        .populate("processedBy", "name")
        .sort({ status: 1, createdAt: -1 }),
      RefundRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amount" } } }]),
      Order.find({ status: "cancelled", refundedAmount: { $gt: 0 } })
        .populate("userId", "name email")
        .sort({ cancelledAt: -1 })
        .limit(25),
    ])

    const summary = { pending: 0, completed: 0, rejected: 0, pendingTotal: 0, completedTotal: 0 }
    counts.forEach((row) => {
      if (row._id === "pending") {
        summary.pending = row.count
        summary.pendingTotal = row.total
      } else if (row._id === "completed") {
        summary.completed = row.count
        summary.completedTotal = row.total
      } else if (row._id === "rejected") {
        summary.rejected = row.count
      }
    })

    // Pre-build the scannable QR for each request so the view stays dumb.
    const requestsWithQr = requests.map((r) => ({
      doc: r,
      qrUrl: walletManager.buildQrUrl({
        bankCode: r.bankCode,
        bankName: r.bankName,
        accountNumber: r.accountNumber,
        accountHolder: r.accountHolder,
        amount: r.amount,
        note: `Hoan tien vi ${r._id.toString().slice(-6).toUpperCase()}`,
      }),
    }))

    res.render("admin/refunds/index", {
      title: "Yeu Cau Hoan Tien",
      currentPage: "refunds",
      requests: requestsWithQr,
      summary,
      statusFilter,
      cancelledOrders,
      success: req.query.success || null,
      error: req.query.error || null,
    })
  } catch (error) {
    console.error("[restaurant] Admin refunds error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

// Admin ticked "already transferred": debit the wallet and close the request.
router.post("/:id/complete", checkAdmin, async (req, res) => {
  try {
    if (req.body.confirmTransferred !== "on" && req.body.confirmTransferred !== "true") {
      return res.redirect("/admin/refunds?error=Vui long tick vao o xac nhan da chuyen tien")
    }

    const request = await RefundRequest.findOne({ _id: req.params.id, status: "pending" }).populate(
      "userId",
      "name walletBalance",
    )
    if (!request) {
      return res.redirect("/admin/refunds?error=Khong tim thay yeu cau dang cho xu ly")
    }

    const debited = await walletManager.debit(request.userId._id, request.amount, {
      type: "withdraw_payout",
      refundRequestId: request._id,
      description: `Hoàn tiền về ${request.bankName} - STK ${request.accountNumber}`,
    })

    if (!debited) {
      return res.redirect("/admin/refunds?error=So du vi khong du de hoan tien. Vui long kiem tra lai.")
    }

    request.status = "completed"
    request.processedBy = req.session.user.id
    request.processedAt = new Date()
    await request.save()

    await Notification.create({
      type: "refund_completed",
      category: "payment",
      userId: request.userId._id,
      amount: request.amount,
      message: `Yêu cầu hoàn tiền ${request.amount.toLocaleString("vi-VN")}đ đã được chuyển về ${request.bankName} - STK ${request.accountNumber}`,
      details: `Số dư ví còn lại: ${debited.balance.toLocaleString("vi-VN")}đ`,
      status: "pending",
    })

    console.log("[restaurant] Refund payout completed:", {
      requestId: String(request._id),
      amount: request.amount,
      remainingBalance: debited.balance,
    })

    res.redirect(
      `/admin/refunds?success=${encodeURIComponent(
        `Da xac nhan chuyen ${request.amount.toLocaleString("vi-VN")}d va tru vao vi khach hang`,
      )}`,
    )
  } catch (error) {
    console.error("[restaurant] Complete refund error:", error)
    res.redirect("/admin/refunds?error=Khong the hoan tat yeu cau")
  }
})

// Reject a request; the money simply stays in the customer wallet.
router.post("/:id/reject", checkAdmin, async (req, res) => {
  try {
    const request = await RefundRequest.findOne({ _id: req.params.id, status: "pending" })
    if (!request) {
      return res.redirect("/admin/refunds?error=Khong tim thay yeu cau dang cho xu ly")
    }

    request.status = "rejected"
    request.rejectReason = String(req.body.rejectReason || "").slice(0, 300)
    request.processedBy = req.session.user.id
    request.processedAt = new Date()
    await request.save()

    await Notification.create({
      type: "refund_rejected",
      category: "payment",
      userId: request.userId,
      amount: request.amount,
      message: `Yêu cầu hoàn tiền ${request.amount.toLocaleString("vi-VN")}đ đã bị từ chối. Số tiền vẫn còn trong ví của bạn.`,
      details: request.rejectReason,
      status: "pending",
    })

    res.redirect("/admin/refunds?success=Da tu choi yeu cau hoan tien")
  } catch (error) {
    console.error("[restaurant] Reject refund error:", error)
    res.redirect("/admin/refunds?error=Khong the tu choi yeu cau")
  }
})

// Wallet ledger of a single customer
router.get("/wallet/:userId", checkAdmin, async (req, res) => {
  try {
    const [customer, transactions] = await Promise.all([
      User.findById(req.params.userId).select("name email phone walletBalance bankInfo"),
      WalletTransaction.find({ userId: req.params.userId })
        .populate("orderId", "orderCode")
        .sort({ createdAt: -1 })
        .limit(100),
    ])

    if (!customer) return res.redirect("/admin/refunds?error=Khong tim thay khach hang")

    res.render("admin/refunds/wallet", {
      title: `Vi cua ${customer.name}`,
      currentPage: "refunds",
      customer,
      transactions,
    })
  } catch (error) {
    console.error("[restaurant] Admin wallet detail error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

module.exports = router
