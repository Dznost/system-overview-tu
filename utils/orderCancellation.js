const Order = require("../models/Order")
const Payment = require("../models/Payment")
const User = require("../models/User")
const Branch = require("../models/Branch")
const Notification = require("../models/Notification")
const inventoryManager = require("./inventoryManager")
const walletManager = require("./walletManager")
const { appendHistory } = require("./guestOrders")

// Statuses that must never be cancelled: the order is already finished or already void.
const NON_CANCELLABLE = ["cancelled", "delivered_success", "served", "delivered", "completed"]

function isCancellable(order) {
  if (!order) return false
  return !NON_CANCELLABLE.includes(order.status)
}

function shortCode(order) {
  return order.orderCode || `#${order._id.toString().slice(-8).toUpperCase()}`
}

/**
 * Cancel an order and settle every side effect in one place:
 *  - restores dish/product inventory
 *  - marks completed payments as "refunded" so revenue reports drop the amount
 *  - credits the refunded money back to the customer wallet
 *  - returns spent loyalty points
 *  - records status history and notifies the customer and admins
 *
 * Returns { ok, reason, refundedAmount }.
 */
async function cancelOrderWithRefund(order, actor, options = {}) {
  if (!order) return { ok: false, reason: "Không tìm thấy đơn hàng" }
  if (order.status === "cancelled") {
    return { ok: false, reason: "already_cancelled", refundedAmount: order.refundedAmount || 0 }
  }
  if (!isCancellable(order)) {
    return { ok: false, reason: "Đơn hàng đã hoàn tất nên không thể hủy" }
  }

  const reason = String(options.reason || "").trim().slice(0, 500)

  // ── 1. Restore inventory ──────────────────────────────────────────────────
  for (const item of order.items || []) {
    try {
      const dishRef = item.dishId && (item.dishId._id || item.dishId)
      const productRef = item.productId && (item.productId._id || item.productId)
      if (item.itemType === "dish" && dishRef) {
        await inventoryManager.incrementQuantity(dishRef, order.branchId || null, item.quantity)
      } else if (item.itemType === "product" && productRef) {
        await inventoryManager.incrementProductQuantity(productRef, order.branchId || null, item.quantity)
      }
    } catch (invErr) {
      console.error("[restaurant] Inventory restore error on cancel:", invErr)
    }
  }

  // ── 2. Void the payments so revenue statistics no longer count them ───────
  const completedPayments = await Payment.find({ orderId: order._id, status: "completed" })
  let paidAmount = 0
  const refundedAt = new Date()

  for (const payment of completedPayments) {
    const amount = payment.finalAmount || payment.amount || 0
    paidAmount += amount
    payment.status = "refunded"
    payment.refundedAt = refundedAt
    payment.refundedAmount = amount
    await payment.save()
  }

  // Wallet money spent on this order is refundable too, even though it never
  // created a Payment row (it was never counted as revenue).
  const walletUsed = order.walletAmountUsed || 0
  const refundableAmount = paidAmount + walletUsed

  // ── 3. Credit the wallet (account customers only) ─────────────────────────
  let refundedAmount = 0
  if (order.userId && refundableAmount > 0) {
    const result = await walletManager.credit(order.userId, refundableAmount, {
      type: "order_refund",
      orderId: order._id,
      description: `Hoàn tiền đơn hàng ${shortCode(order)} đã hủy`,
    })
    if (result) refundedAmount = refundableAmount
  }

  // ── 4. Give back the loyalty points that were spent ───────────────────────
  if (order.userId && order.loyaltyPointsUsed > 0) {
    try {
      await User.findByIdAndUpdate(order.userId, { $inc: { loyaltyPoints: order.loyaltyPointsUsed } })
    } catch (loyaltyErr) {
      console.error("[restaurant] Loyalty restore error on cancel:", loyaltyErr)
    }
  }

  // ── 5. Release the dine-in table ──────────────────────────────────────────
  if (order.orderType === "dine-in" && order.branchId) {
    try {
      const branch = await Branch.findById(order.branchId)
      if (branch && typeof branch.availableTables === "number") {
        branch.availableTables += 1
        await branch.save()
      }
    } catch (branchErr) {
      console.error("[restaurant] Branch table restore error on cancel:", branchErr)
    }
  }

  // ── 6. Persist the cancelled state ────────────────────────────────────────
  order.status = "cancelled"
  order.cancelledAt = refundedAt
  order.cancelledBy = actor && actor._id ? actor._id : null
  order.cancelledByRole = (actor && actor.role) || "customer"
  order.cancelReason = reason
  order.refundedAmount = refundedAmount
  if (refundedAmount > 0) {
    order.refundedToWalletAt = refundedAt
    order.paymentStatus = "unpaid"
    order.collectionStatus = "not_collected"
  }

  const actorLabel = (actor && actor.name) || "Khách hàng"
  const refundNote = refundedAmount > 0
    ? ` Đã hoàn ${refundedAmount.toLocaleString("vi-VN")}đ vào ví khách hàng.`
    : " Đơn chưa thanh toán nên không phát sinh hoàn tiền."
  appendHistory(order, {
    status: "cancelled",
    actor: actor || { role: "customer", name: actorLabel },
    note: `Đơn hàng đã hủy${reason ? ` (lý do: ${reason})` : ""}.${refundNote}`,
  })

  await order.save()

  // ── 7. Notify the customer and every admin ────────────────────────────────
  try {
    if (order.userId) {
      await Notification.create({
        type: "order_cancelled",
        category: "order",
        orderId: order._id,
        userId: order.userId,
        amount: refundedAmount,
        message: refundedAmount > 0
          ? `Đơn hàng ${shortCode(order)} đã hủy. ${refundedAmount.toLocaleString("vi-VN")}đ đã được hoàn vào ví của bạn.`
          : `Đơn hàng ${shortCode(order)} đã được hủy.`,
        details: reason || "",
        status: "pending",
      })
    }

    const admins = await User.find({ role: "admin" }).select("_id")
    for (const admin of admins) {
      await Notification.create({
        type: "order_cancelled",
        category: "order",
        priority: refundedAmount > 0 ? "high" : "normal",
        orderId: order._id,
        userId: admin._id,
        targetUserId: order.userId || null,
        amount: refundedAmount,
        message: `${actorLabel} đã hủy đơn hàng ${shortCode(order)}${
          refundedAmount > 0 ? ` - hoàn ${refundedAmount.toLocaleString("vi-VN")}đ vào ví` : ""
        }`,
        details: refundedAmount > 0
          ? `Doanh thu đã được trừ ${refundedAmount.toLocaleString("vi-VN")}đ. Tồn kho đã phục hồi.`
          : "Đơn chưa thanh toán. Tồn kho đã phục hồi.",
        userNote: reason || "",
        status: "pending",
      })
    }
  } catch (notifyErr) {
    console.error("[restaurant] Cancel notification error:", notifyErr)
  }

  console.log("[restaurant] Order cancelled:", {
    orderId: String(order._id),
    refundedAmount,
    voidedPayments: completedPayments.length,
  })

  return { ok: true, refundedAmount, voidedPayments: completedPayments.length }
}

module.exports = { cancelOrderWithRefund, isCancellable, NON_CANCELLABLE }
