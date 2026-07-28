const express = require("express")
const router = express.Router()
const Dish = require("../models/Dish")
const Branch = require("../models/Branch")
const Event = require("../models/Event")
const Blog = require("../models/Blog")
const User = require("../models/User")
const Order = require("../models/Order")
const Reservation = require("../models/Reservation")
const Contact = require("../models/Contact")

// Middleware to check if user is admin
const checkAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect("/auth/login?error=Vui+lòng+đăng+nhập")
  }
  if (req.session.user.role !== "admin") {
    return res.status(403).render("error", { 
      error: "Bạn không có quyền truy cập",
      layout: false 
    })
  }
  next()
}

// Dashboard
router.get("/", checkAdmin, async (req, res) => {
  try {
    const dishCount = await Dish.countDocuments()
    const branchCount = await Branch.countDocuments()
    const userCount = await User.countDocuments({ role: "user" })
    const eventCount = await Event.countDocuments()
    const reservationCount = await Reservation.countDocuments()
    const orderCount = await Order.countDocuments()
    const blogCount = await Blog.countDocuments()

    // Get recent orders and reservations
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate("userId")
    const recentReservations = await Reservation.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId")
      .populate("branchId")

    res.render("admin/dashboard", {
      dishCount,
      branchCount,
      userCount,
      eventCount,
      reservationCount,
      orderCount,
      blogCount,
      recentOrders,
      recentReservations,
    })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

// Dishes management
router.get("/dishes", checkAdmin, async (req, res) => {
  try {
    const dishes = await Dish.find()
    res.render("admin/dishes", { dishes })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/dish/new", checkAdmin, (req, res) => {
  res.render("admin/dish-form", { dish: null })
})

router.post("/dish", checkAdmin, async (req, res) => {
  try {
    const { name, description, price, image, category, discount } = req.body
    const dish = new Dish({ name, description, price, image, category, discount })
    await dish.save()
    res.redirect("/admin/dishes?success=Dish added successfully")
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/dish/:id/edit", checkAdmin, async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id)
    res.render("admin/dish-form", { dish })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.post("/dish/:id", checkAdmin, async (req, res) => {
  try {
    const { name, description, price, image, category, discount } = req.body
    await Dish.findByIdAndUpdate(req.params.id, { name, description, price, image, category, discount })
    res.redirect("/admin/dishes?success=Dish updated successfully")
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/dish/:id/delete", checkAdmin, async (req, res) => {
  try {
    await Dish.findByIdAndDelete(req.params.id)
    res.redirect("/admin/dishes?success=Dish deleted successfully")
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

// Branches management
router.get("/branches", checkAdmin, async (req, res) => {
  try {
    const branches = await Branch.find()
    res.render("admin/branches", { branches })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/branch/new", checkAdmin, async (req, res) => {
  try {
    const dishes = await Dish.find()
    res.render("admin/branch-form", { branch: null, dishes })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.post("/branch", checkAdmin, async (req, res) => {
  try {
    const { name, address, phone, email, image, images, openingHours, description, totalTables, dishes } = req.body
    
    const imagesArray = images ? images.split(',').map(img => img.trim()).filter(img => img) : []
    const dishesArray = dishes ? (Array.isArray(dishes) ? dishes : [dishes]) : []
    
    const branch = new Branch({ 
      name, 
      address, 
      phone, 
      email, 
      image, 
      images: imagesArray,
      openingHours, 
      description,
      totalTables: totalTables || 20,
      availableTables: totalTables || 20,
      dishes: dishesArray
    })
    await branch.save()
    res.redirect("/admin/branches?success=Chi nhánh đã được thêm thành công")
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/branch/:id/edit", checkAdmin, async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id).populate("dishes")
    const dishes = await Dish.find()
    res.render("admin/branch-form", { branch, dishes })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.post("/branch/:id", checkAdmin, async (req, res) => {
  try {
    const { name, address, phone, email, image, images, openingHours, description, totalTables, availableTables, dishes } = req.body
    
    const imagesArray = images ? images.split(',').map(img => img.trim()).filter(img => img) : []
    const dishesArray = dishes ? (Array.isArray(dishes) ? dishes : [dishes]) : []
    
    await Branch.findByIdAndUpdate(req.params.id, { 
      name, 
      address, 
      phone, 
      email, 
      image,
      images: imagesArray,
      openingHours, 
      description,
      totalTables,
      availableTables,
      dishes: dishesArray
    })
    res.redirect("/admin/branches?success=Chi nhánh đã được cập nhật thành công")
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/branch/:id/delete", checkAdmin, async (req, res) => {
  try {
    await Branch.findByIdAndDelete(req.params.id)
    res.redirect("/admin/branches?success=Branch deleted successfully")
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

// Events management
router.get("/events", checkAdmin, async (req, res) => {
  try {
    const events = await Event.find()
    res.render("admin/events", { events })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/event/new", checkAdmin, async (req, res) => {
  try {
    const branches = await Branch.find()
    res.render("admin/event-form", { event: null, branches })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

const validateEventDates = (startDate, endDate) => {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start <= now) {
    return { valid: false, error: "Ngày bắt đầu phải lớn hơn ngày hiện tại" }
  }
  if (end <= start) {
    return { valid: false, error: "Ngày kết thúc phải lớn hơn ngày bắt đầu" }
  }
  return { valid: true }
}

const validateReservationDate = (date, time) => {
  const now = new Date()
  const reservationDateTime = new Date(`${date}T${time}`)

  if (reservationDateTime <= now) {
    return { valid: false, error: "Ngày giờ đặt bàn phải lớn hơn thời gian hiện tại" }
  }
  return { valid: true }
}

router.post("/event", checkAdmin, async (req, res) => {
  try {
    const { title, description, image, discount, startDate, endDate, branches, discountScope, dishes } = req.body

    const validation = validateEventDates(startDate, endDate)
    if (!validation.valid) {
      const allBranches = await Branch.find()
      return res.status(400).render("admin/event-form", {
        event: null,
        branches: allBranches,
        error: validation.error,
      })
    }

    const branchesArray = branches ? (Array.isArray(branches) ? branches : [branches]) : []
    const dishesArray = dishes ? (Array.isArray(dishes) ? dishes : [dishes]) : []
    const scope = discountScope || "global"
    
    const event = new Event({ 
      title, 
      description, 
      image, 
      discount, 
      startDate, 
      endDate,
      discountScope: scope,
      branches: scope === "branch" ? branchesArray : [],
      dishes: dishesArray,
    })
    await event.save()
    res.redirect("/admin/events?success=Su kien duoc them thanh cong")
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/event/:id/edit", checkAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("branches")
    const branches = await Branch.find()
    res.render("admin/event-form", { event, branches })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.post("/event/:id", checkAdmin, async (req, res) => {
  try {
    const { title, description, image, discount, startDate, endDate, branches, discountScope, dishes } = req.body

    const validation = validateEventDates(startDate, endDate)
    if (!validation.valid) {
      const event = await Event.findById(req.params.id)
      const allBranches = await Branch.find()
      return res.status(400).render("admin/event-form", {
        event,
        branches: allBranches,
        error: validation.error,
      })
    }

    const branchesArray = branches ? (Array.isArray(branches) ? branches : [branches]) : []
    const dishesArray = dishes ? (Array.isArray(dishes) ? dishes : [dishes]) : []
    const scope = discountScope || "global"

    await Event.findByIdAndUpdate(req.params.id, { 
      title, 
      description, 
      image, 
      discount, 
      startDate, 
      endDate,
      discountScope: scope,
      branches: scope === "branch" ? branchesArray : [],
      dishes: dishesArray,
    })
    res.redirect("/admin/events?success=Su kien duoc cap nhat thanh cong")
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/event/:id/delete", checkAdmin, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id)
    res.redirect("/admin/events?success=Event deleted successfully")
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/blog", checkAdmin, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 })
    res.render("admin/blog", { blogs })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/blog/new", checkAdmin, (req, res) => {
  res.render("admin/blog-form", { blog: null })
})

router.post("/blog", checkAdmin, async (req, res) => {
  try {
    const { title, content, image, author } = req.body
    const blog = new Blog({ title, content, image, author })
    await blog.save()
    res.redirect("/admin/blog?success=Blog added successfully")
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/blog/:id/edit", checkAdmin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    res.render("admin/blog-form", { blog })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.post("/blog/:id", checkAdmin, async (req, res) => {
  try {
    const { title, content, image, author } = req.body
    await Blog.findByIdAndUpdate(req.params.id, { title, content, image, author })
    res.redirect("/admin/blog?success=Blog updated successfully")
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/blog/:id/delete", checkAdmin, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id)
    res.redirect("/admin/blog?success=Blog deleted successfully")
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/orders", checkAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate("userId").populate("items.dishId")
    res.render("admin/orders", { orders })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/order/:id", checkAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("userId").populate("items.dishId")
    res.render("admin/order-detail", { order })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.post("/order/:id/status", checkAdmin, async (req, res) => {
  try {
    const { status } = req.body
    await Order.findByIdAndUpdate(req.params.id, { status })
    res.redirect("/admin/orders?success=Order status updated")
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.post("/order/:id/complete-cod", checkAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).render("404", { layout: false })

    if (order.paymentTiming === "cod") {
      order.status = "completed"
      order.paymentStatus = "paid"
      order.paymentMethod = "cash"
      order.paidAt = new Date()
      await order.save()
      
      res.redirect("/admin/orders?success=Đơn hàng COD đã được xác nhận thanh toán")
    } else {
      res.redirect("/admin/orders?error=Đơn hàng này không phải COD")
    }
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

// Guest orders (orders created by receptionist on behalf of guests)
router.get("/guest-orders", checkAdmin, async (req, res) => {
  try {
    const statusFilter = req.query.status || "all"
    const searchQuery = req.query.q || ""

    let query = { orderFor: "reception_behalf" }
    
    if (statusFilter !== "all") {
      query.status = statusFilter
    }

    if (searchQuery) {
      query.$or = [
        { guestName: { $regex: searchQuery, $options: "i" } },
        { guestPhone: { $regex: searchQuery, $options: "i" } },
      ]
    }

    const orders = await Order.find(query)
      .populate("staffId", "name")
      .populate("branchId", "name")
      .sort({ createdAt: -1 })

    res.render("admin/guest-orders/index", {
      title: "Quan Ly Don Dat Ban Ho Khach",
      orders,
      statusFilter,
      searchQuery,
    })
  } catch (error) {
    console.error("[admin] Guest orders error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

// Guest order detail
router.get("/guest-orders/:id", checkAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("staffId", "name")
      .populate("branchId", "name")
      .populate("items.dishId")

    if (!order || order.orderFor !== "reception_behalf") {
      return res.status(404).render("error", { error: "Không tìm thấy đơn đặt bàn", layout: false })
    }

    // Get payment record if exists
    const payment = await Payment.findOne({ orderId: order._id }).populate("collectedBy", "name")

    res.render("admin/guest-orders/detail", {
      title: "Chi Tiet Don Dat Ban",
      order,
      payment,
    })
  } catch (error) {
    console.error("[admin] Guest order detail error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

// Update guest order status
router.post("/guest-orders/:id/status", checkAdmin, async (req, res) => {
  try {
    const { status, paymentStatus, paymentMethod } = req.body
    const order = await Order.findById(req.params.id)
    
    if (!order) {
      return res.status(404).render("error", { error: "Không tìm thấy đơn hàng", layout: false })
    }
    
    if (status) order.status = status
    if (paymentStatus) {
      order.paymentStatus = paymentStatus
      if (paymentStatus === "paid" && !order.paidAt) {
        order.paidAt = new Date()
        
        // Create payment record if doesn't exist
        const existingPayment = await Payment.findOne({ orderId: order._id })
        if (!existingPayment) {
          const payment = new Payment({
            orderId: order._id,
            userId: order.staffId || order.userId,
            amount: order.totalPrice,
            discount: order.discount || 0,
            finalAmount: order.finalPrice,
            paymentMethod: paymentMethod || order.paymentMethod || "cash",
            status: "completed",
            revenueType: "guest_order",
            branchId: order.branchId,
            collectedBy: req.session.user.id,
            isGuestOrder: true,
            guestName: order.guestName,
            guestPhone: order.guestPhone,
            guestEmail: order.guestEmail || "",
            depositAmount: order.depositAmount || 100000,
            createdByStaff: order.staffId,
            paidAt: new Date(),
          })
          await payment.save()
          console.log("[admin] Created payment for guest order:", payment._id)
        }
      }
    }

    await order.save()
    res.redirect(`/admin/guest-orders/${req.params.id}?success=Cap nhat thanh cong`)
  } catch (error) {
    console.error("[admin] Update guest order error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/reservations", checkAdmin, async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 }).populate("userId").populate("branchId")
    res.render("admin/reservations", { reservations })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/reservation/:id", checkAdmin, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate("userId").populate("branchId")
    res.render("admin/reservation-detail", { reservation })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.post("/reservation/:id/status", checkAdmin, async (req, res) => {
  try {
    const { status } = req.body
    await Reservation.findByIdAndUpdate(req.params.id, { status })
    res.redirect("/admin/reservations?success=Reservation status updated")
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/users", checkAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).sort({ createdAt: -1 })
    res.render("admin/users", { users })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/user/:id", checkAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    const orders = await Order.find({ userId: req.params.id }).populate("branchId")
    const reservations = await Reservation.find({ userId: req.params.id }).populate("branchId")
    const Payment = require("../models/Payment")
    const payments = await Payment.find({ userId: req.params.id }).populate("orderId").populate("reservationId")
    
    res.render("admin/user-detail", { user, orders, reservations, payments })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/user/:id/delete", checkAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.redirect("/admin/users?success=User deleted successfully")
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/contacts", checkAdmin, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 })
    res.render("admin/contacts", { contacts })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/contact/:id", checkAdmin, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
    if (!contact) return res.status(404).render("404", { layout: false })

    // Mark as read
    if (contact.status === "new") {
      contact.status = "read"
      await contact.save()
    }

    res.render("admin/contact-detail", { contact })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.post("/contact/:id/reply", checkAdmin, async (req, res) => {
  try {
    const { reply } = req.body
    await Contact.findByIdAndUpdate(req.params.id, { reply, status: "replied" })
    res.redirect("/admin/contacts?success=Phản hồi đã được gửi")
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/contact/:id/delete", checkAdmin, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id)
    res.redirect("/admin/contacts?success=Liên hệ đã được xóa")
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

// Reviews management - combined view for orders and reservations
router.get("/reviews", checkAdmin, async (req, res) => {
  try {
    // Get all orders with ratings
    const ratedOrders = await Order.find({ rating: { $exists: true, $ne: null } })
      .populate("userId", "name email phone")
      .populate("shipperId", "name phone")
      .populate("staffId", "name phone")
      .populate("branchId", "name")
      .sort({ ratedAt: -1 })

    // Get all reservations with ratings
    const ratedReservations = await Reservation.find({ rating: { $exists: true, $ne: null } })
      .populate("userId", "name email phone")
      .populate("staffId", "name phone")
      .populate("branchId", "name")
      .sort({ ratedAt: -1 })

    // Calculate statistics
    const totalReviews = ratedOrders.length + ratedReservations.length
    const allRatings = [...ratedOrders.map(o => o.rating), ...ratedReservations.map(r => r.rating)]
    const averageRating = allRatings.length > 0 ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1) : 0
    
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    allRatings.forEach(r => { if (ratingCounts[r] !== undefined) ratingCounts[r]++ })
    
    const positiveCount = ratingCounts[4] + ratingCounts[5]
    const negativeCount = ratingCounts[1] + ratingCounts[2]

    res.render("admin/reviews/index", {
      ratedOrders,
      ratedReservations,
      totalReviews,
      averageRating,
      ratingCounts,
      positiveCount,
      negativeCount,
      currentPage: "reviews"
    })
  } catch (error) {
    console.error("[restaurant] Admin reviews error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

// Revenue statistics route
router.get("/revenue", checkAdmin, async (req, res) => {
  try {
    const { year, month } = req.query
    const currentYear = year ? parseInt(year) : new Date().getFullYear()
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1

    // Get all paid payments
    const Payment = require("../models/Payment")
    
    let startDate, endDate
    if (month) {
      // Monthly view
      startDate = new Date(currentYear, currentMonth - 1, 1)
      endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59)
    } else {
      // Yearly view
      startDate = new Date(currentYear, 0, 1)
      endDate = new Date(currentYear, 11, 31, 23, 59, 59)
    }

    const payments = await Payment.find({
      status: "completed",
      paidAt: { $gte: startDate, $lte: endDate }
    }).populate("orderId").populate("reservationId").populate("userId")

    // Calculate statistics
    let totalRevenue = 0
    let totalDiscount = 0
    let orderRevenue = 0
    let reservationRevenue = 0
    let orderCount = 0
    let reservationCount = 0

    const monthlyData = Array(12).fill(0)
    const paymentMethods = { bank: 0, cash: 0, transfer: 0 }
    
    // Separate payments by type
    const deliveryPayments = []
    const receptionPayments = []
    const guestOrderPayments = []
    let deliveryTotal = 0
    let receptionTotal = 0
    
    // Shipper breakdown
    const shipperMap = {}

    payments.forEach(payment => {
      totalRevenue += payment.finalAmount
      totalDiscount += payment.discount || 0
      
      if (payment.orderId) {
        orderRevenue += payment.finalAmount
        orderCount++
      } else if (payment.reservationId) {
        reservationRevenue += payment.finalAmount
        reservationCount++
      }

      // Count by payment method
      if (paymentMethods.hasOwnProperty(payment.paymentMethod)) {
        paymentMethods[payment.paymentMethod] += payment.finalAmount
      }

      // Monthly breakdown for yearly view
      if (!month) {
        const paymentMonth = new Date(payment.paidAt).getMonth()
        monthlyData[paymentMonth] += payment.finalAmount
      }
      
      // Separate by revenue type
      if (payment.revenueType === "delivery") {
        deliveryPayments.push(payment)
        deliveryTotal += payment.finalAmount
        
        // Track shipper revenue
        if (payment.collectedBy) {
          const shipperId = payment.collectedBy.toString()
          if (!shipperMap[shipperId]) {
            shipperMap[shipperId] = { 
              id: shipperId, 
              name: payment.userId?.name || "Shipper", 
              email: payment.userId?.email || "",
              count: 0, 
              total: 0 
            }
          }
          shipperMap[shipperId].count++
          shipperMap[shipperId].total += payment.finalAmount
        }
      } else if (payment.revenueType === "reception" || payment.revenueType === "walkin_assist") {
        receptionPayments.push(payment)
        receptionTotal += payment.finalAmount
      } else if (payment.revenueType === "guest_order") {
        guestOrderPayments.push(payment)
        receptionTotal += payment.finalAmount // Count as reception revenue
        receptionPayments.push(payment)
      }
    })
    
    // Convert shipper map to array
    const shipperBreakdown = Object.values(shipperMap).sort((a, b) => b.total - a.total)
    
    // Calculate system totals
    const systemTotal = totalRevenue
    const totalTransactions = payments.length
    
    // Calculate averages
    const daysInPeriod = month ? new Date(currentYear, currentMonth, 0).getDate() : 365
    const dailyAverage = daysInPeriod > 0 ? Math.round(totalRevenue / daysInPeriod) : 0
    const avgTransactionValue = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0

    // Get COD orders (paid but not in Payment collection yet)
    const codOrders = await Order.find({
      paymentTiming: "cod",
      status: "completed",
      paidAt: { $gte: startDate, $lte: endDate }
    })

    codOrders.forEach(order => {
      totalRevenue += order.finalPrice
      orderRevenue += order.finalPrice
      orderCount++
      paymentMethods.cash += order.finalPrice
      
      if (!month) {
        const orderMonth = new Date(order.paidAt).getMonth()
        monthlyData[orderMonth] += order.finalPrice
      }
    })

    // Get guest orders (reception_behalf) - separate tracking
    const guestOrders = await Order.find({
      orderFor: "reception_behalf",
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate("staffId", "name").populate("branchId", "name")

    let guestOrderRevenue = 0
    let guestOrderDeposit = 0
    let guestOrderCount = guestOrders.length
    let guestOrderPaidCount = 0

    guestOrders.forEach(order => {
      guestOrderDeposit += order.depositAmount || 0
      if (order.paymentStatus === "paid") {
        guestOrderRevenue += order.finalPrice
        guestOrderPaidCount++
      }
    })

    res.render("admin/revenue", {
      totalRevenue,
      totalDiscount,
      orderRevenue,
      reservationRevenue,
      orderCount,
      reservationCount,
      paymentMethods,
      monthlyData,
      payments,
      currentYear,
      currentMonth,
      viewType: month ? 'monthly' : 'yearly',
      // System totals
      systemTotal,
      totalTransactions,
      dailyAverage,
      avgTransactionValue,
      // Delivery stats
      deliveryPayments,
      deliveryTotal,
      shipperBreakdown,
      // Reception stats
      receptionPayments,
      receptionTotal,
      // Guest order stats
      guestOrders,
      guestOrderRevenue,
      guestOrderDeposit,
      guestOrderCount,
      guestOrderPaidCount,
      guestOrderPayments
    })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

module.exports = router
