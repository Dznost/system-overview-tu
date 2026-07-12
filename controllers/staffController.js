const Order = require("../models/Order")
const Reservation = require("../models/Reservation")
const User = require("../models/User")
const Branch = require("../models/Branch")
const Dish = require("../models/Dish")
const Notification = require("../models/Notification")
const bcrypt = require("bcryptjs")
const { appendHistory } = require("../utils/guestOrders")
const { issueWarrantiesForOrder } = require("../utils/warrantyManager")

// Dashboard
exports.getDashboard = async (req, res) => {
  try {
    const staffId = req.session.user.id

    const processingOrders = await Order.countDocuments({ staffId, status: { $in: ["confirmed", "preparing", "ready", "processing"] } })
    const completedOrders = await Order.countDocuments({ staffId, status: { $in: ["served", "completed"] } })

    const processingReservations = await Reservation.countDocuments({ staffId, status: { $in: ["confirmed", "paid", "processing"] } })
    const completedReservations = await Reservation.countDocuments({ staffId, status: "completed" })

    const activeOrders = await Order.find({ staffId, status: { $in: ["confirmed", "preparing", "ready", "processing"] } })
      .populate("userId", "name email phone")
      .populate("branchId", "name")
      .sort({ createdAt: -1 })
      .limit(5)

    const activeReservations = await Reservation.find({ staffId, status: { $in: ["confirmed", "paid", "processing"] } })
      .populate("userId", "name email phone")
      .populate("branchId", "name")
      .sort({ date: 1 })
      .limit(5)

    res.render("staff/dashboard", {
      title: "Trang Nhan Vien",
      processingOrders,
      completedOrders,
      processingReservations,
      completedReservations,
      activeOrders,
      activeReservations,
    })
  } catch (error) {
    console.error("[restaurant] Staff dashboard error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
}

// Dine-in orders list
exports.getOrders = async (req, res) => {
  try {
    const staffId = req.session.user.id
    const statusFilter = req.query.status || "all"

    let query = { staffId }
    if (statusFilter === "processing") query.status = { $in: ["confirmed", "preparing", "ready", "processing"] }
    else if (statusFilter === "completed") query.status = { $in: ["served", "completed"] }

    const orders = await Order.find(query)
      .populate("userId", "name email phone")
      .populate("branchId", "name")
      .sort({ createdAt: -1 })

    res.render("staff/orders/index", {
      title: "Don Hang Tai Quan",
      orders,
      statusFilter,
    })
  } catch (error) {
    console.error("[restaurant] Staff orders error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
}

// Order detail
exports.getOrderDetail = async (req, res) => {
  try {
    const staffId = req.session.user.id
    const order = await Order.findOne({ _id: req.params.id, staffId })
      .populate("userId", "name email phone address")
      .populate("branchId", "name address")

    if (!order) {
      return res.status(404).render("404", { layout: false })
    }

    res.render("staff/orders/detail", {
      title: "Chi Tiet Don Hang",
      order,
      success: req.query.success || null,
    })
  } catch (error) {
    console.error("[restaurant] Staff order detail error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
}

// Move an assigned dine-in order through preparation in sequence.
exports.updateOrderProgress = async (req, res) => {
  try {
    const staffId = req.session.user.id
    const nextStatus = String(req.body.status || "")
    const transitions = { confirmed: "preparing", preparing: "ready" }
    const order = await Order.findOne({ _id: req.params.id, staffId })
    if (!order) return res.status(404).render("404", { layout: false })
    if (transitions[order.status] !== nextStatus) {
      return res.redirect(`/staff/orders/${order._id}?success=invalid-status`)
    }

    order.status = nextStatus
    appendHistory(order, {
      status: nextStatus,
      actor: { id: staffId, name: req.session.user.name || "Nhân viên", role: "staff" },
      note: nextStatus === "preparing" ? "Nhân viên bắt đầu chuẩn bị đơn." : "Đơn đã sẵn sàng để phục vụ.",
    })
    await order.save()
    res.redirect(`/staff/orders/${order._id}?success=${nextStatus}`)
  } catch (error) {
    console.error("[restaurant] Staff order progress error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
}

// Confirm order completed
exports.confirmOrderCompleted = async (req, res) => {
  try {
    const staffId = req.session.user.id
    const { confirmCode } = req.body

    if (confirmCode !== "CONFIRMED") {
      return res.redirect(`/staff/orders/${req.params.id}?success=false`)
    }

    const order = await Order.findOne({ _id: req.params.id, staffId, status: "ready" })
    if (!order) {
      return res.status(404).render("404", { layout: false })
    }

    order.status = "served"
    order.paymentStatus = "paid"
    order.confirmedBy = staffId
    order.confirmedAt = new Date()
    order.deliveredAt = order.confirmedAt
    appendHistory(order, {
      status: "served",
      actor: { id: staffId, name: req.session.user.name || "Nhân viên", role: "staff" },
      note: "Nhân viên xác nhận đơn tại quán đã phục vụ xong.",
    })
    await order.save()
    await order.populate("items.productId")
    await issueWarrantiesForOrder(order)

    // Restore table availability when dine-in order is completed
    if (order.orderType === "dine-in" && order.branchId) {
      const Branch = require("../models/Branch")
      const branch = await Branch.findById(order.branchId)
      if (branch) {
        branch.availableTables += 1
        await branch.save()
      }
    }

    res.redirect(`/staff/orders/${req.params.id}?success=completed`)
  } catch (error) {
    console.error("[restaurant] Staff confirm order error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
}

// Reservations list
exports.getReservations = async (req, res) => {
  try {
    const staffId = req.session.user.id
    const statusFilter = req.query.status || "all"

    let query = { staffId }
    if (statusFilter === "processing") query.status = { $in: ["confirmed", "paid", "processing"] }
    else if (statusFilter === "completed") query.status = "completed"

    const reservations = await Reservation.find(query)
      .populate("userId", "name email phone")
      .populate("branchId", "name")
      .sort({ date: -1 })

    res.render("staff/reservations/index", {
      title: "Dat Ban",
      reservations,
      statusFilter,
    })
  } catch (error) {
    console.error("[restaurant] Staff reservations error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
}

// Reservation detail
exports.getReservationDetail = async (req, res) => {
  try {
    const staffId = req.session.user.id
    const reservation = await Reservation.findOne({ _id: req.params.id, staffId })
      .populate("userId", "name email phone")
      .populate("branchId", "name address")

    if (!reservation) {
      return res.status(404).render("404", { layout: false })
    }

    res.render("staff/reservations/detail", {
      title: "Chi Tiet Dat Ban",
      reservation,
      success: req.query.success || null,
    })
  } catch (error) {
    console.error("[restaurant] Staff reservation detail error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
}

// Confirm reservation completed
exports.confirmReservationCompleted = async (req, res) => {
  try {
    const staffId = req.session.user.id
    const { confirmCode } = req.body

    if (confirmCode !== "CONFIRMED") {
      return res.redirect(`/staff/reservations/${req.params.id}?success=false`)
    }

    const reservation = await Reservation.findOne({ _id: req.params.id, staffId, status: { $in: ["confirmed", "paid", "processing"] } })
    if (!reservation) {
      return res.status(404).render("404", { layout: false })
    }

    reservation.status = "completed"
    reservation.paymentStatus = "paid"
    await reservation.save()

    // Restore table availability
    if (reservation.branchId) {
      const Branch = require("../models/Branch")
      const branch = await Branch.findById(reservation.branchId)
      if (branch) {
        branch.availableTables += 1
        await branch.save()
      }
    }

    res.redirect(`/staff/reservations/${req.params.id}?success=completed`)
  } catch (error) {
    console.error("[restaurant] Staff confirm reservation error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
}

// Guest order form (đặt hộ khách)
exports.getGuestOrderForm = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id)
    const branchId = user.branchId
    
    if (!branchId) {
      return res.redirect("/staff?error=Ban chua duoc gan chi nhanh")
    }

    const branch = await Branch.findById(branchId).populate("dishes")
    let dishes = branch && branch.dishes && branch.dishes.length > 0
      ? branch.dishes.filter(d => d.available)
      : await Dish.find({ available: true }).sort({ category: 1, name: 1 })

    res.render("staff/guest-orders/create", {
      title: "Dat Don Hang Ho Khach",
      branch,
      dishes,
      success: req.query.success || null,
      error: req.query.error || null,
    })
  } catch (error) {
    console.error("[restaurant] Staff guest order form error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
}

// Create guest order (đặt hộ khách)
exports.createGuestOrder = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id)
    const branchId = user.branchId
    const staffId = req.session.user.id
    
    if (!branchId) {
      return res.redirect("/staff?error=Ban chua duoc gan chi nhanh")
    }

    const { guestName, guestPhone, guestEmail, bookingDate, bookingTime, specialRequests, items } = req.body

    // Validate guest info
    if (!guestName || !guestPhone) {
      return res.redirect("/staff/guest-orders/create?error=Vui long nhap day du ten va so dien thoai khach")
    }

    // Validate booking date/time - must be 2+ hours from now
    if (!bookingDate || !bookingTime) {
      return res.redirect("/staff/guest-orders/create?error=Vui long chon ngay va gio dat ban")
    }
    
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`)
    const now = new Date()
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    if (isNaN(bookingDateTime.getTime()) || bookingDateTime < twoHoursLater) {
      return res.redirect("/staff/guest-orders/create?error=Thoi gian dat ban phai toi thieu 2 tieng tu bay gio")
    }

    // Parse items
    let parsedItems = []
    if (typeof items === "string") {
      try { parsedItems = JSON.parse(items) } catch(e) { parsedItems = [] }
    } else if (Array.isArray(items)) {
      parsedItems = items
    }

    if (!parsedItems || parsedItems.length === 0) {
      return res.redirect("/staff/guest-orders/create?error=Vui long chon it nhat 1 mon")
    }

    // Fetch dish data and calculate totals
    const dishIds = parsedItems.map(i => i.dishId)
    const dishDocs = await Dish.find({ _id: { $in: dishIds } })
    const dishMap = {}
    dishDocs.forEach(d => { dishMap[d._id.toString()] = d })

    let orderItems = []
    let totalPrice = 0

    parsedItems.forEach(item => {
      const dish = dishMap[item.dishId]
      if (dish) {
        const qty = parseInt(item.quantity) || 1
        const discountedPrice = dish.discount > 0 ? dish.price * (1 - dish.discount / 100) : dish.price
        orderItems.push({
          dishId: dish._id,
          name: dish.name,
          quantity: qty,
          price: discountedPrice,
          discount: dish.discount || 0,
        })
        totalPrice += discountedPrice * qty
      }
    })

    if (orderItems.length === 0) {
      return res.redirect("/staff/guest-orders/create?error=Khong tim thay mon an hop le")
    }

    // Add 100k deposit for guest order
    const depositAmount = 100000
    const finalPrice = totalPrice + depositAmount

    // Create order for guest
    const order = new Order({
      userId: staffId,
      items: orderItems,
      orderType: "dine-in",
      branchId: branchId,
      guests: 1,
      orderFor: "reception_behalf",
      guestName: guestName,
      guestPhone: guestPhone,
      guestEmail: guestEmail || "",
      depositAmount: depositAmount,
      minBookingTime: bookingDateTime,
      paymentTiming: "prepaid",
      totalPrice: totalPrice,
      discount: 0,
      finalPrice: finalPrice,
      status: "pending", // Will be processed by staff
      paymentStatus: "unpaid", // Not paid yet - will pay when guest arrives
      paymentMethod: "transfer", // Bắt buộc chuyển khoản
      fullName: guestName,
      email: guestEmail || "",
      phone: guestPhone,
      specialRequests: specialRequests || "",
      staffId: staffId,
    })

    await order.save()

    // Reduce available tables
    const branch = await Branch.findById(branchId)
    if (branch && branch.availableTables > 0) {
      branch.availableTables -= 1
      await branch.save()
    }

    // Notify admin about new guest order
    const admin = await User.findOne({ role: "admin" })
    if (admin) {
      const notification = new Notification({
        type: "guest_order",
        orderId: order._id,
        userId: admin._id,
        branchId: branchId,
        amount: finalPrice,
        message: `Don dat ban ho khach moi: ${guestName} (${guestPhone}) - Thoi gian: ${bookingDateTime.toLocaleString("vi-VN")} - Tien coc: 100.000d - Tong: ${finalPrice.toLocaleString("vi-VN")}d`,
        category: "order",
        priority: "high",
      })
      await notification.save()
    }

    // Notify other staff in the same branch to process
    const branchStaff = await User.find({ 
      branchId: branchId, 
      role: { $in: ["staff", "reception"] },
      _id: { $ne: staffId } // Exclude creator
    })
    
    for (const staff of branchStaff) {
      const staffNotif = new Notification({
        type: "guest_order_assigned",
        orderId: order._id,
        userId: staff._id,
        branchId: branchId,
        amount: finalPrice,
        message: `Don dat ban ho khach can xu ly: ${guestName} - Thoi gian: ${bookingDateTime.toLocaleString("vi-VN")}`,
        category: "order",
      })
      await staffNotif.save()
    }

    res.redirect(`/staff/guest-orders/${order._id}?success=created`)
  } catch (error) {
    console.error("[restaurant] Staff create guest order error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
}

// List guest orders in staff's branch
exports.getGuestOrders = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id)
    const branchId = user.branchId
    const statusFilter = req.query.status || "all"

    // Show all guest orders in the branch (not just created by this staff)
    let query = { branchId: branchId, orderFor: "reception_behalf" }
    if (statusFilter !== "all") {
      query.status = statusFilter
    }

    const orders = await Order.find(query)
      .populate("branchId", "name")
      .populate("staffId", "name")
      .sort({ createdAt: -1 })

    res.render("staff/guest-orders/index", {
      title: "Don Dat Ban Ho Khach",
      orders,
      statusFilter,
    })
  } catch (error) {
    console.error("[restaurant] Staff guest orders error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
}

// Guest order detail
exports.getGuestOrderDetail = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id)
    const branchId = user.branchId
    
    // Staff can view guest orders in their branch
    const order = await Order.findOne({ 
      _id: req.params.id, 
      branchId: branchId, 
      orderFor: "reception_behalf" 
    })
      .populate("branchId", "name address")
      .populate("staffId", "name")

    if (!order) {
      return res.status(404).render("404", { layout: false })
    }

    // Get payment if exists
    const Payment = require("../models/Payment")
    const payment = await Payment.findOne({ orderId: order._id })

    res.render("staff/guest-orders/detail", {
      title: "Chi Tiet Don Dat Ban",
      order,
      payment,
      success: req.query.success || null,
      error: req.query.error || null,
    })
  } catch (error) {
    console.error("[restaurant] Staff guest order detail error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
}

// Confirm guest order completed (when guest arrives and pays)
exports.confirmGuestOrderCompleted = async (req, res) => {
  try {
    const Payment = require("../models/Payment")
    const user = await User.findById(req.session.user.id)
    const branchId = user.branchId
    const staffId = req.session.user.id
    const { confirmCode, paymentMethod } = req.body

    if (confirmCode !== "CONFIRMED") {
      return res.redirect(`/staff/guest-orders/${req.params.id}?error=Ma xac nhan khong dung`)
    }

    // Staff can confirm orders in their branch (not just their own)
    const order = await Order.findOne({ 
      _id: req.params.id, 
      branchId: branchId, 
      orderFor: "reception_behalf", 
      status: { $in: ["pending", "processing", "approved"] } 
    })
    if (!order) {
      return res.status(404).render("404", { layout: false })
    }
    
    // Check if payment already exists
    const existingPayment = await Payment.findOne({ orderId: order._id })
    if (existingPayment) {
      return res.redirect(`/staff/guest-orders/${req.params.id}?error=Don hang da duoc thanh toan`)
    }

    order.status = "completed"
    order.paymentStatus = "paid"
    order.confirmedBy = staffId
    order.confirmedAt = new Date()
    order.paidAt = new Date()
    await order.save()

    // Create payment record for guest order
    const payment = new Payment({
      orderId: order._id,
      userId: staffId, // Staff who created the order
      amount: order.totalPrice,
      discount: order.discount || 0,
      finalAmount: order.finalPrice,
      paymentMethod: paymentMethod || "cash",
      status: "completed",
      revenueType: "guest_order",
      branchId: order.branchId,
      collectedBy: staffId,
      // Guest order specific info
      isGuestOrder: true,
      guestName: order.guestName,
      guestPhone: order.guestPhone,
      guestEmail: order.guestEmail || "",
      depositAmount: order.depositAmount || 100000,
      createdByStaff: order.staffId,
      paidAt: new Date(),
    })
    await payment.save()

    console.log("[restaurant] Guest order payment created:", payment._id, "for order:", order._id)

    // Restore table availability
    if (order.branchId) {
      const branch = await Branch.findById(order.branchId)
      if (branch) {
        branch.availableTables += 1
        await branch.save()
      }
    }

    // Notify admin about completed guest order
    const admin = await User.findOne({ role: "admin" })
    if (admin) {
      const notification = new Notification({
        type: "guest_order_completed",
        orderId: order._id,
        userId: admin._id,
        branchId: order.branchId,
        amount: order.finalPrice,
        message: `Don dat ban ho khach ${order.guestName} da hoan thanh - ${order.finalPrice.toLocaleString("vi-VN")}d`,
        category: "payment",
      })
      await notification.save()
    }

    res.redirect(`/staff/guest-orders/${req.params.id}?success=completed`)
  } catch (error) {
    console.error("[restaurant] Staff confirm guest order error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
}

// Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).populate("branchId", "name address").populate("pendingBranchId", "name address")
    if (!user) {
      return res.redirect("/auth/logout")
    }

    const branches = await Branch.find().select("name address")

    res.render("staff/profile", {
      title: "Ho So Nhan Vien",
      profile: user,
      branches,
      success: req.query.success || null,
      error: req.query.error || null,
    })
  } catch (error) {
    console.error("[restaurant] Staff profile error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
}

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body
    const user = await User.findById(req.session.user.id)

    if (!user) return res.redirect("/auth/logout")

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) return res.redirect("/staff/profile?error=Mat khau hien tai khong dung")

    if (newPassword !== confirmPassword) return res.redirect("/staff/profile?error=Mat khau moi khong khop")

    if (newPassword.length < 6) return res.redirect("/staff/profile?error=Mat khau phai co it nhat 6 ky tu")

    user.password = newPassword
    await user.save()

    res.redirect("/staff/profile?success=Doi mat khau thanh cong")
  } catch (error) {
    console.error("[restaurant] Staff change password error:", error)
    res.redirect("/staff/profile?error=Loi he thong")
  }
}

// Request branch change
exports.requestBranchChange = async (req, res) => {
  try {
    const { newBranchId } = req.body
    const user = await User.findById(req.session.user.id)

    if (!user) return res.redirect("/auth/logout")

    const branch = await Branch.findById(newBranchId)
    if (!branch) return res.redirect("/staff/profile?error=Chi nhanh khong ton tai")

    if (user.branchId && user.branchId.toString() === newBranchId) {
      return res.redirect("/staff/profile?error=Ban da o chi nhanh nay roi")
    }

    if (user.branchChangeStatus === "pending") {
      return res.redirect("/staff/profile?error=Ban da co yeu cau dang cho duyet")
    }

    user.pendingBranchId = newBranchId
    user.branchChangeStatus = "pending"
    await user.save()

    const admin = await User.findOne({ role: "admin" })
    if (admin) {
      const notification = new Notification({
        type: "branch_change_request",
        userId: admin._id,
        amount: 0,
        message: `Nhan vien ${user.name} yeu cau doi chi nhanh sang ${branch.name}`,
      })
      await notification.save()
    }

    res.redirect("/staff/profile?success=Da gui yeu cau doi chi nhanh. Vui long cho admin duyet.")
  } catch (error) {
    console.error("[restaurant] Staff request branch change error:", error)
    res.redirect("/staff/profile?error=Loi he thong")
  }
}
