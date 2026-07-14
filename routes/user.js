const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Reservation = require("../models/Reservation")
const Order = require("../models/Order")
const Payment = require("../models/Payment")
const Branch = require("../models/Branch")
const Dish = require("../models/Dish")
const Event = require("../models/Event")
const Notification = require("../models/Notification")
const Product = require("../models/Product")
const Review = require("../models/Review")
const {
  normalizePhone,
  orderCode,
  getLimit,
  recordFailure,
  clearFailures,
  grantGuestAccess,
  hasGuestAccess,
  appendHistory,
} = require("../utils/guestOrders")

// Middleware to check if user is logged in
const checkAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login")
  }
  next()
}

// Middleware to check if user is an admin
const checkAdmin = (req, res, next) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.redirect("/login")
  }
  next()
}

// Profile
router.get("/profile", checkAuth, async (req, res) => {
  try {
    var user = await User.findById(req.session.user.id)
      .populate("branchId", "name address")
      .populate("pendingBranchId", "name address")
    var reservations = await Reservation.find({ userId: req.session.user.id })
      .populate("branchId")
      .populate("staffId", "name phone")
      .sort({ createdAt: -1 })
    var orders = await Order.find({ userId: req.session.user.id })
      .sort({ createdAt: -1 })
    var branches = await Branch.find().select("name address")
    res.render("user/profile/index", { 
      user: user,
      reservations: reservations, 
      orders: orders,
      branches: branches,
      success: req.query.success || null,
      error: req.query.error || null
    })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

// Update profile
router.post("/update-profile", checkAuth, async (req, res) => {
  try {
    var { name, email, phone, address } = req.body;
    var user = await User.findById(req.session.user.id);
    
    if (!user) {
      return res.redirect("/user/profile?error=Khong tim thay tai khoan");
    }

    // Check if email is already used by another user
    if (email !== user.email) {
      var existingUser = await User.findOne({ email: email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.redirect("/user/profile?error=Email nay da duoc su dung");
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    await user.save();

    // Update session
    req.session.user.name = user.name;
    req.session.user.email = user.email;
    req.session.user.phone = user.phone;

    res.redirect("/user/profile?success=Cap nhat ho so thanh cong");
  } catch (error) {
    console.error("[restaurant] Update profile error:", error);
    res.redirect("/user/profile?error=Loi khi cap nhat ho so");
  }
})

// Change password
router.post("/change-password", checkAuth, async (req, res) => {
  try {
    var currentPassword = req.body.currentPassword;
    var newPassword = req.body.newPassword;
    var confirmPassword = req.body.confirmPassword;

    var user = await User.findById(req.session.user.id);
    if (!user) {
      return res.redirect("/user/profile?error=Khong tim thay tai khoan");
    }

    // Verify current password
    var isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.redirect("/user/profile?error=Mat khau hien tai khong dung");
    }

    if (!newPassword || newPassword.length < 6) {
      return res.redirect("/user/profile?error=Mat khau moi phai co it nhat 6 ky tu");
    }

    if (newPassword !== confirmPassword) {
      return res.redirect("/user/profile?error=Mat khau xac nhan khong khop");
    }

    user.password = newPassword;
    await user.save();

    res.redirect("/user/profile?success=Doi mat khau thanh cong");
  } catch (error) {
    console.error("[restaurant] User change password error:", error);
    res.redirect("/user/profile?error=Loi khi doi mat khau");
  }
})

// Request branch change for reception role
router.post("/request-branch-change", checkAuth, async (req, res) => {
  try {
    var user = await User.findById(req.session.user.id)
    if (!user) return res.redirect("/auth/logout")

    if (user.role !== "reception") {
      return res.redirect("/user/profile?error=Chi danh cho nhan vien le tan")
    }

    var newBranchId = req.body.newBranchId
    var branch = await Branch.findById(newBranchId)
    if (!branch) return res.redirect("/user/profile?error=Chi nhanh khong ton tai")

    if (user.branchId && user.branchId.toString() === newBranchId) {
      return res.redirect("/user/profile?error=Ban da o chi nhanh nay roi")
    }

    if (user.branchChangeStatus === "pending") {
      return res.redirect("/user/profile?error=Ban da co yeu cau dang cho duyet")
    }

    user.pendingBranchId = newBranchId
    user.branchChangeStatus = "pending"
    await user.save()

    var admin = await User.findOne({ role: "admin" })
    if (admin) {
      var notification = new Notification({
        type: "branch_change_request",
        userId: admin._id,
        amount: 0,
        message: "Le tan " + user.name + " yeu cau doi chi nhanh sang " + branch.name,
      })
      await notification.save()
    }

    res.redirect("/user/profile?success=Da gui yeu cau doi chi nhanh. Vui long cho admin duyet.")
  } catch (error) {
    console.error("[restaurant] Reception request branch change error:", error)
    res.redirect("/user/profile?error=Loi he thong")
  }
})

// Reservation form
router.get("/reservation", checkAuth, async (req, res) => {
  try {
    const branches = await Branch.find().populate("dishes")
    const dishes = await Dish.find({ available: true })
    res.render("user/reservation/index", { branches, dishes })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.post("/reservation", checkAuth, async (req, res) => {
  try {
    const { branchId, date, time, guests, specialRequests, dishes } = req.body

    const validation = validateReservationDate(date, time)
    if (!validation.valid) {
      const branches = await Branch.find()
      const allDishes = await Dish.find({ available: true })
      return res.status(400).render("user/reservation/index", {
        branches,
        dishes: allDishes,
        error: validation.error,
      })
    }

    // Check table availability
    const branch = await Branch.findById(branchId)
    if (!branch) {
      const branches = await Branch.find()
      const allDishes = await Dish.find({ available: true })
      return res.status(400).render("user/reservation/index", {
        branches,
        dishes: allDishes,
        error: "Chi nhánh không tồn tại",
      })
    }

    if (branch.availableTables < 1) {
      const branches = await Branch.find()
      const allDishes = await Dish.find({ available: true })
      return res.status(400).render("user/reservation/index", {
        branches,
        dishes: allDishes,
        error: "Không còn bàn trống tại chi nhánh này",
      })
    }

    const orderItems = []
    let foodTotal = 0
    let foodDiscount = 0

    if (dishes) {
      for (const [dishId, dishData] of Object.entries(dishes)) {
        const quantity = Number.parseInt(dishData.quantity) || 0
        if (quantity > 0) {
          const dish = await Dish.findById(dishId)
          if (dish) {
            const itemTotal = dish.price * quantity
            const itemDiscount = (dish.discount / 100) * itemTotal

            foodTotal += itemTotal
            foodDiscount += itemDiscount

            orderItems.push({
              dishId: dish._id,
              name: dish.name,
              quantity,
              price: dish.price,
              discount: dish.discount || 0,
            })
          }
        }
      }
    }

    const depositAmount = 100000 // Fixed deposit
    const totalAmount = depositAmount + (foodTotal - foodDiscount)

    const reservation = new Reservation({
      userId: req.session.user.id,
      branchId,
      date,
      time,
      guests,
      specialRequests,
      orderItems,
      depositAmount,
      foodTotal,
      foodDiscount,
      totalAmount,
      status: "pending",
      paymentStatus: "unpaid",
    })

    await reservation.save()

    // Decrease available tables
    branch.availableTables -= 1
    await branch.save()

    // Auto-assign reservation to staff - round-robin by _id
    try {
      const staffMembers = await User.find({ role: "staff" }).select("name").sort({ _id: 1 })

      if (staffMembers.length > 0) {
        // Find the last reservation assigned to staff
        const lastAssigned = await Reservation.findOne({ staffId: { $ne: null } }).sort({ createdAt: -1 }).select("staffId")
        
        let selectedIndex = 0
        if (lastAssigned && lastAssigned.staffId) {
          const lastIdx = staffMembers.findIndex(s => s._id.toString() === lastAssigned.staffId.toString())
          if (lastIdx !== -1) {
            selectedIndex = (lastIdx + 1) % staffMembers.length
          }
        }
        
        const selectedStaff = staffMembers[selectedIndex]
        reservation.staffId = selectedStaff._id
        await reservation.save()

        const staffNotif = new Notification({
          type: "reservation_assigned",
          userId: selectedStaff._id,
          amount: totalAmount,
          message: `Ban duoc giao dat ban #${reservation._id.toString().slice(-6).toUpperCase()} - ${totalAmount.toLocaleString('vi-VN')}d`,
        })
        await staffNotif.save()
        console.log("[restaurant] Auto-assigned reservation to staff:", selectedStaff.name, "(ID index:", selectedIndex, ")")
      }
    } catch (assignError) {
      console.error("[restaurant] Reservation auto-assign error (non-critical):", assignError)
    }

    // Redirect to payment page immediately (must pay before confirmation)
    res.redirect(`/user/payment/reservation/${reservation._id}`)
  } catch (error) {
    console.error("[restaurant] Reservation error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

// Cart
router.get("/cart", async (req, res) => {
  try {
    const cart = req.session.cart || []
    
    // Refresh every cart item from the database instead of trusting stale session data.
    for (const item of cart) {
      const record = item.itemType === "product" || item.productId
        ? await Product.findById(item.productId)
        : await Dish.findById(item.dishId)
      if (record) {
        item.availableQuantity = Math.max(0, Number(record.quantity) || 0)
        item.image = record.image || record.images?.[0] || ""
        item.name = record.name
        item.price = Number(record.price) || 0
        item.discount = Number(record.discount) || 0
      } else {
        item.availableQuantity = 0
      }
    }
    
    res.render("user/cart/index", { cart })
  } catch (error) {
    console.error("[restaurant] Error in cart route:", error)
    res.render("user/cart/index", { cart: req.session.cart || [] })
  }
})

// Add to cart
router.post("/cart/add", async (req, res) => {
  try {
    const { dishId, productId, quantity } = req.body

    if (!req.session.cart) req.session.cart = []

    const requestedQuantity = Number.parseInt(quantity, 10)
    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      return res.redirect("/user/cart?error=Số lượng phải là số nguyên dương")
    }

    // Handle dish
    if (dishId) {
      const dish = await Dish.findById(dishId)

      if (!dish) {
        return res.redirect("/menu?error=Khong tim thay mon an nay")
      }

      const availableQuantity = dish.quantity || 0

      // Check if requested quantity exceeds available quantity
      if (requestedQuantity > availableQuantity) {
        return res.redirect(`/menu?error=So luong yeu cau (${requestedQuantity}) vuot qua hang co san (${availableQuantity})`)
      }

      const existingItem = req.session.cart.find((item) => String(item.dishId) === String(dishId))
      if (existingItem) {
        const newQuantity = existingItem.quantity + requestedQuantity
        if (newQuantity > availableQuantity) {
          return res.redirect(`/menu?error=So luong yeu cau (${newQuantity}) vuot qua hang co san (${availableQuantity})`)
        }
        existingItem.quantity = newQuantity
      } else {
        req.session.cart.push({
          dishId,
          itemType: "dish",
          name: dish.name,
          price: dish.price,
          discount: dish.discount || 0,
          quantity: requestedQuantity,
        })
      }

      res.redirect("/user/cart")
    }
    // Handle product
    else if (productId) {
      const product = await Product.findById(productId)

      if (!product) {
        return res.redirect("/products?error=Khong tim thay san pham nay")
      }

      const availableQuantity = product.quantity || 0

      // Check if product is out of stock (HOT products can't be ordered if qty=0)
      if (availableQuantity === 0) {
        return res.redirect(`/products?error=San pham ${product.name} da het hang`)
      }

      // Check if requested quantity exceeds available quantity
      if (requestedQuantity > availableQuantity) {
        return res.redirect(`/products?error=So luong yeu cau (${requestedQuantity}) vuot qua hang co san (${availableQuantity})`)
      }

      const existingItem = req.session.cart.find((item) => String(item.productId) === String(productId))
      if (existingItem) {
        const newQuantity = existingItem.quantity + requestedQuantity
        if (newQuantity > availableQuantity) {
          return res.redirect(`/products?error=So luong yeu cau (${newQuantity}) vuot qua hang co san (${availableQuantity})`)
        }
        existingItem.quantity = newQuantity
      } else {
        req.session.cart.push({
          productId,
          itemType: "product",
          name: product.name,
          price: product.price,
          discount: product.discount || 0,
          quantity: requestedQuantity,
        })
      }

      res.redirect("/user/cart")
    } else {
      return res.redirect("/menu?error=Yeu cau khong hop le")
    }
  } catch (error) {
    console.error("[restaurant] Error in add to cart:", error)
    res.redirect("/menu?error=Co loi khi them san pham vao gio hang")
  }
})

router.get("/cart/remove/:itemId", (req, res) => {
  if (req.session.cart) {
    // Remove item by either dishId or productId
    req.session.cart = req.session.cart.filter((item) =>
      String(item.dishId || "") !== String(req.params.itemId) &&
      String(item.productId || "") !== String(req.params.itemId)
    )
  }
  res.redirect("/user/cart")
})

// Update cart item quantity
router.post("/cart/update", async (req, res) => {
  try {
    const { dishId, productId, quantity } = req.body
    const newQuantity = Number.parseInt(quantity, 10)

    if (!req.session.cart || !Number.isInteger(newQuantity) || newQuantity < 1) {
      return res.redirect("/user/cart?error=So luong khong hop le")
    }

    let cartItem = null
    let availableQuantity = 0

    // Find and validate item
    if (dishId) {
      cartItem = req.session.cart.find(item => item.dishId === dishId)
      if (cartItem) {
        const dish = await Dish.findById(dishId)
        if (dish) {
          availableQuantity = dish.quantity || 0
        }
      }
    } else if (productId) {
      cartItem = req.session.cart.find(item => item.productId === productId)
      if (cartItem) {
        const product = await Product.findById(productId)
        if (product) {
          availableQuantity = product.quantity || 0
        }
      }
    }

    if (!cartItem) {
      return res.redirect("/user/cart?error=San pham khong tim thay")
    }

    // Validate quantity
    if (newQuantity > availableQuantity) {
      return res.redirect(`/user/cart?error=So luong yeu cau (${newQuantity}) vuot qua hang co san (${availableQuantity})`)
    }

    // Update quantity
    cartItem.quantity = newQuantity
    res.redirect("/user/cart")
  } catch (error) {
    console.error("[restaurant] Error updating cart:", error)
    res.redirect("/user/cart?error=Co loi khi cap nhat gio hang")
  }
})

// Checkout
router.get("/checkout", async (req, res) => {
  try {
    const cart = req.session.cart || []

    if (cart.length === 0) {
      return res.redirect("/user/cart?error=Giỏ hàng trống")
    }

    let total = 0
    let totalDiscount = 0

    for (const item of cart) {
      // Handle dish
      if (item.dishId) {
        const dish = await Dish.findById(item.dishId)
        if (dish) {
          const availableQuantity = dish.quantity || 0
          
          // Check if ordered quantity exceeds available
          if (item.quantity > availableQuantity) {
            return res.redirect(`/user/cart?error=Mon ${dish.name}: so luong yeu cau (${item.quantity}) vuot qua hang co san (${availableQuantity})`)
          }
          
          const itemTotal = dish.price * item.quantity
          const itemDiscount = (dish.discount / 100) * itemTotal
          total += itemTotal
          totalDiscount += itemDiscount
          item.discount = dish.discount
          item.availableQuantity = availableQuantity
        }
      }
      // Handle product
      else if (item.productId) {
        const product = await Product.findById(item.productId)
        if (product) {
          const availableQuantity = product.quantity || 0
          
          // Check if product is out of stock
          if (availableQuantity === 0) {
            return res.redirect(`/user/cart?error=San pham ${product.name}: da het hang`)
          }
          
          // Check if ordered quantity exceeds available
          if (item.quantity > availableQuantity) {
            return res.redirect(`/user/cart?error=San pham ${product.name}: so luong yeu cau (${item.quantity}) vuot qua hang co san (${availableQuantity})`)
          }
          
          const itemTotal = product.price * item.quantity
          const itemDiscount = (product.discount / 100) * itemTotal
          total += itemTotal
          totalDiscount += itemDiscount
          item.discount = product.discount
          item.availableQuantity = availableQuantity
        }
      }
    }

    const finalTotal = total - totalDiscount
    const isCODRestricted = finalTotal > 10000000

    // Rubric 5.5: Lay diem loyalty cua khach dang nhap
    let loyaltyPoints = 0
    if (req.session.user && req.session.user.id) {
      const user = await User.findById(req.session.user.id)
      loyaltyPoints = user && user.loyaltyPoints ? user.loyaltyPoints : 0
    }

    res.render("user/checkout/index", {
      cart,
      total,
      totalDiscount,
      finalTotal,
      isCODRestricted,
      loyaltyPoints,
      checkoutUser: req.session.user || null,
      checkoutError: req.query.error || null,
    })
  } catch (error) {
    console.error("[restaurant] Error in checkout:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

// Validate a coupon code against the current cart total (used by checkout live-apply)
router.post("/validate-coupon", require("../controllers/couponController").validateCoupon)

router.post("/order", async (req, res) => {
  try {
    const {
      deliveryAddress,
      fullName,
      email,
      phone,
      specialRequests,
      paymentTiming,
      largeOrderNote,
      couponCode,
      loyaltyPointsToUse,
    } = req.body
    const cart = req.session.cart || []
    const normalizedPhone = normalizePhone(phone)
    const sessionUserId = req.session.user && req.session.user.id

    if (!String(fullName || "").trim() || !normalizedPhone || !String(deliveryAddress || "").trim()) {
      return res.redirect("/user/checkout?error=Vui lòng nhập họ tên, số điện thoại Việt Nam hợp lệ và địa chỉ giao hàng")
    }
    if (!["cod", "prepaid"].includes(paymentTiming)) {
      return res.redirect("/user/checkout?error=Phương thức thanh toán không hợp lệ")
    }

    if (cart.length === 0) {
      return res.status(400).render("error", { error: "Giỏ hàng trống", layout: false })
    }

    let totalPrice = 0
    let totalDiscount = 0
    let couponDiscount = 0
    let loyaltyPointsUsed = 0
    const items = []

    // Loyalty is available only for authenticated customers.
    const user = sessionUserId ? await User.findById(sessionUserId) : null

    for (const item of cart) {
      // Handle dish
      if (item.dishId) {
        const dish = await Dish.findById(item.dishId)
        if (dish) {
          const requestedQuantity = Number(item.quantity)
          if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1 || requestedQuantity > Number(dish.quantity || 0)) {
            return res.redirect(`/user/cart?error=${encodeURIComponent(`Món ${dish.name} không đủ số lượng`)}`)
          }
          const itemPrice = dish.price * requestedQuantity
          const itemDiscount = (dish.discount / 100) * itemPrice
          totalPrice += itemPrice
          totalDiscount += itemDiscount

          items.push({
            dishId: dish._id,
            itemType: "dish",
            name: dish.name,
            quantity: requestedQuantity,
            price: dish.price,
            discount: dish.discount,
          })
        }
      }
      // Handle product
      else if (item.productId) {
        const product = await Product.findById(item.productId)
        if (product) {
          const requestedQuantity = Number(item.quantity)
          if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1 || requestedQuantity > Number(product.quantity || 0)) {
            return res.redirect(`/user/cart?error=${encodeURIComponent(`Sản phẩm ${product.name} không đủ số lượng`)}`)
          }
          const itemPrice = product.price * requestedQuantity
          const itemDiscount = (product.discount / 100) * itemPrice
          totalPrice += itemPrice
          totalDiscount += itemDiscount

          items.push({
            productId: product._id,
            itemType: "product",
            name: product.name,
            quantity: requestedQuantity,
            price: product.price,
            discount: product.discount,
          })
        }
      }
    }

    // Process coupon if provided
    if (couponCode) {
      const Coupon = require("../models/Coupon");
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

      if (coupon && coupon.isValid() && (totalPrice - totalDiscount) >= coupon.minOrderAmount) {
        couponDiscount =
          coupon.discountType === "percentage"
            ? Math.round(((totalPrice - totalDiscount) * coupon.discountValue) / 100)
            : coupon.discountValue;

        // Track coupon usage
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
      }
    }

    // Process loyalty points if provided
    if (loyaltyPointsToUse && user) {
      const pointsToUse = Number(loyaltyPointsToUse);
      // 1 point = 1,000 VND
      const pointsValue = pointsToUse * 1000;

      if (pointsToUse > 0 && user.loyaltyPoints >= pointsToUse) {
        loyaltyPointsUsed = pointsToUse;
      }
    }

    if (items.length !== cart.length) {
      return res.redirect("/user/cart?error=Giỏ hàng có sản phẩm không còn tồn tại")
    }
    const finalPrice = Math.max(0, totalPrice - totalDiscount - couponDiscount - loyaltyPointsUsed * 1000);

    if (finalPrice > 10000000 && paymentTiming === "cod") {
      return res.status(400).render("error", {
        error: "Đơn hàng trên 10 triệu đồng chỉ được thanh toán bằng chuyển khoản ngân hàng",
        layout: false,
      })
    }

    const order = new Order({
      userId: sessionUserId || null,
      orderCode: `DH${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      customerPhoneNormalized: normalizedPhone,
      isGuestCheckout: !sessionUserId,
      items,
      orderType: "takeaway",
      orderFor: "customer",
      paymentTiming: paymentTiming || "prepaid",
      totalPrice,
      discount: totalDiscount,
      couponCode: couponCode || null,
      couponDiscount,
      loyaltyPointsUsed,
      finalPrice,
      deliveryAddress,
      fullName,
      email,
      phone,
      specialRequests,
      largeOrderNote: largeOrderNote || null,
      status: "pending_approval",
    })
    appendHistory(order, {
      status: "pending_approval",
      actor: user || { role: "customer", name: String(fullName).trim() },
      note: "Đơn hàng đã được tiếp nhận và đang chờ xác nhận.",
    })

    await order.save()
    if (!sessionUserId) {
      grantGuestAccess(req, normalizedPhone)
      req.session.guestOrderIds = [...new Set([...(req.session.guestOrderIds || []), order._id.toString()])]
    }

    // Rubric 1.1: Dat hang thanh cong thi so luong hang hoa bi tru
    const inventoryManager = require("../utils/inventoryManager")
    for (const item of items) {
      try {
        if (item.itemType === "dish" && item.dishId) {
          await inventoryManager.decrementQuantity(item.dishId, order.branchId || null, item.quantity)
        } else if (item.itemType === "product" && item.productId) {
          await inventoryManager.decrementProductQuantity(item.productId, order.branchId || null, item.quantity)
        }
      } catch (invErr) {
        console.error("[restaurant] Inventory deduction error:", invErr)
      }
    }

    // Account customers receive a personal notification; guest customers use the order code.
    if (sessionUserId) {
      await Notification.create({
        type: "new_order",
        category: "order",
        orderId: order._id,
        userId: sessionUserId,
        amount: finalPrice,
        message: `Đơn hàng ${order.orderCode} đã được tạo thành công. Số tiền: ${finalPrice.toLocaleString("vi-VN")}đ`,
        status: "pending",
      })
    }

    if (finalPrice > 100000000) {
      const admin = await User.findOne({ role: "admin" }).select("_id")
      if (admin) {
        await Notification.create({
          type: "large_order",
          category: "order",
          orderId: order._id,
          userId: admin._id,
          amount: finalPrice,
          message: `Đơn hàng giá trị cao: ${finalPrice.toLocaleString("vi-VN")}đ từ khách hàng ${fullName}`,
          userNote: largeOrderNote || "Không có yêu cầu đặc biệt",
          status: "pending",
        })
        order.adminNotified = true
        await order.save()
      }
    }

    if (order.orderType === "dine-in" && order.branchId) {
      const branch = await Branch.findById(order.branchId)
      if (branch && branch.availableTables > 0) {
        branch.availableTables -= 1
        await branch.save()
        console.log("[restaurant] Table decremented for dine-in order:", {
          branchId: order.branchId,
          remainingTables: branch.availableTables,
        })
      }
    }

    // Auto-assign order to shipper (takeaway) or staff (dine-in)
    // Round-robin by _id: sorted low to high, find last assigned, pick next, cycle back
    try {
      if (order.orderType === "takeaway") {
        // Get all shippers sorted by _id ascending
        const shippers = await User.find({ role: "shipper" }).select("name").sort({ _id: 1 })
        
        if (shippers.length > 0) {
          // Find the last takeaway order that was assigned to a shipper
          const lastAssigned = await Order.findOne({ shipperId: { $ne: null }, orderType: "takeaway" }).sort({ createdAt: -1 }).select("shipperId")
          
          let selectedIndex = 0
          if (lastAssigned && lastAssigned.shipperId) {
            // Find the index of the last assigned shipper
            const lastIdx = shippers.findIndex(s => s._id.toString() === lastAssigned.shipperId.toString())
            if (lastIdx !== -1) {
              selectedIndex = (lastIdx + 1) % shippers.length // Next in line, cycle back
            }
          }
          
          const selectedShipper = shippers[selectedIndex]
          order.shipperId = selectedShipper._id
          order.assignedShipperId = selectedShipper._id
          order.assignedAt = new Date()
          order.status = "assigned_shipper"
          appendHistory(order, {
            status: "assigned_shipper",
            actor: selectedShipper,
            note: `Đơn hàng đã được chuyển cho shipper ${selectedShipper.name}.`,
          })
          await order.save()

          const shipperNotif = new Notification({
            type: "order_assigned",
            orderId: order._id,
            userId: selectedShipper._id,
            amount: finalPrice,
            message: `Ban duoc giao don hang giao tai nha #${order._id.toString().slice(-6).toUpperCase()} - ${finalPrice.toLocaleString('vi-VN')}d`,
          })
          await shipperNotif.save()
          console.log("[restaurant] Auto-assigned takeaway order to shipper:", selectedShipper.name, "(ID index:", selectedIndex, ")")
        }
      } else if (order.orderType === "dine-in") {
        // Get all staff sorted by _id ascending
        const staffMembers = await User.find({ role: "staff" }).select("name").sort({ _id: 1 })

        if (staffMembers.length > 0) {
          // Find the last dine-in order that was assigned to staff
          const lastAssigned = await Order.findOne({ staffId: { $ne: null }, orderType: "dine-in" }).sort({ createdAt: -1 }).select("staffId")
          
          let selectedIndex = 0
          if (lastAssigned && lastAssigned.staffId) {
            const lastIdx = staffMembers.findIndex(s => s._id.toString() === lastAssigned.staffId.toString())
            if (lastIdx !== -1) {
              selectedIndex = (lastIdx + 1) % staffMembers.length
            }
          }
          
          const selectedStaff = staffMembers[selectedIndex]
          order.staffId = selectedStaff._id
          order.status = "processing"
          await order.save()

          const staffNotif = new Notification({
            type: "order_assigned",
            orderId: order._id,
            userId: selectedStaff._id,
            amount: finalPrice,
            message: `Ban duoc giao don an tai quan #${order._id.toString().slice(-6).toUpperCase()} - ${finalPrice.toLocaleString('vi-VN')}d`,
          })
          await staffNotif.save()
          console.log("[restaurant] Auto-assigned dine-in order to staff:", selectedStaff.name, "(ID index:", selectedIndex, ")")
        }
      }
    } catch (assignError) {
      console.error("[restaurant] Auto-assign error (non-critical):", assignError)
    }

    req.session.cart = []

    if (paymentTiming === "cod") {
      return res.redirect(sessionUserId
        ? "/user/profile?success=Đặt hàng thành công! Thanh toán khi nhận hàng"
        : `/user/track-order/${order.orderCode}?success=Đặt hàng thành công`)
    }
    res.redirect(`/user/payment/order/${order._id}`)
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.get("/payment/order/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("userId").populate("branchId")

    if (!order) return res.status(404).render("404", { layout: false })
    const ownsOrder = Boolean(req.session.user && order.userId && order.userId._id.toString() === req.session.user.id)
    const guestOwnsOrder = (req.session.guestOrderIds || []).includes(order._id.toString())
    if (!ownsOrder && !guestOwnsOrder) {
      return res.status(403).render("error", { error: "Không có quyền truy cập", layout: false })
    }

    if (order.paymentStatus === "paid") {
      return res.redirect("/user/profile?error=Đơn hàng đã được thanh toán")
    }

    res.render("user/payment/index", {
      order,
      reservation: null,
      type: "order",
      title: "Thanh Toán Đơn Hàng",
    })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.post("/payment/order/:orderId/confirm", async (req, res) => {
  try {
    const { paymentMethod } = req.body
    if (!['bank', 'cash'].includes(paymentMethod)) {
      return res.status(400).render("error", { error: "Phương thức thanh toán không hợp lệ", layout: false })
    }

    const order = await Order.findById(req.params.orderId).populate("items.dishId").populate("items.productId")
    if (!order) return res.status(404).render("404", { layout: false })
    const ownsOrder = Boolean(req.session.user && order.userId && order.userId.toString() === req.session.user.id)
    const guestOwnsOrder = (req.session.guestOrderIds || []).includes(order._id.toString())
    if (!ownsOrder && !guestOwnsOrder) {
      return res.status(403).render("error", { error: "Không có quyền truy cập", layout: false })
    }
    if (order.paymentStatus === "paid" || await Payment.exists({ orderId: order._id, status: "completed" })) {
      return res.redirect("/user/profile?error=Đơn hàng đã được thanh toán")
    }

    // COD is only registered as awaiting collection; it is not revenue until delivery is confirmed.
    if (paymentMethod === "cash") {
      order.paymentMethod = "cash"
      order.paymentStatus = "unpaid"
      order.collectionStatus = "pending_collection"
      await order.save()
      return res.redirect("/user/profile?success=Đặt hàng thành công! Thanh toán khi nhận hàng")
    }

    let revenueType = "delivery"
    if (order.orderType === "dine-in") {
      revenueType = order.orderFor === "reception_behalf" ? "guest_order" : "reception"
    }

    const paidAt = new Date()
    await Payment.create({
      orderId: order._id,
      userId: order.userId,
      amount: order.totalPrice,
      discount: order.discount,
      finalAmount: order.finalPrice,
      paymentMethod: "bank",
      status: "completed",
      revenueType,
      branchId: order.orderType === "dine-in" ? (order.branchId || null) : null,
      transactionId: `TXN${Date.now()}${order._id.toString().slice(-6)}`,
      paidAt,
      isGuestOrder: order.orderFor === "reception_behalf",
      guestName: order.guestName || "",
      guestPhone: order.guestPhone || "",
      guestEmail: order.guestEmail || "",
      depositAmount: order.depositAmount || 0,
      createdByStaff: order.createdByStaff || null,
    })

    order.paymentStatus = "paid"
    order.paymentMethod = "bank"
    order.collectionStatus = "collected"
    order.paidAt = paidAt
    // A paid order still follows the fulfilment workflow; do not use a non-existent `completed` status.
    if (order.status === "pending_approval") order.status = "approved"
    await order.save()

    const inventoryManager = require("../utils/inventoryManager")
    for (const item of order.items) {
      if (item.itemType === "dish" && item.dishId) await inventoryManager.incrementOrderCount(item.dishId._id)
      if (item.itemType === "product" && item.productId) await inventoryManager.incrementProductOrderCount(item.productId._id)
    }

    res.redirect(order.userId
      ? "/user/profile?success=Thanh toán thành công!"
      : `/user/track-order/${order.orderCode}?success=Thanh toán thành công`)

  } catch (error) {
    console.error("[restaurant] Payment confirmation error:", error)
    res.status(500).render("error", { error: "Không thể xác nhận thanh toán. Vui lòng thử lại.", layout: false })
  }
})

router.get("/payment/reservation/:reservationId", checkAuth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.reservationId)
      .populate("userId")
      .populate("branchId")
      .populate("orderItems.dishId")

    if (!reservation) return res.status(404).render("404", { layout: false })
    if (reservation.userId._id.toString() !== req.session.user.id) {
      return res.status(403).render("error", { error: "Không có quyền truy cập", layout: false })
    }

    if (reservation.paymentStatus === "paid") {
      return res.redirect("/user/profile?error=Đặt bàn đã được thanh toán")
    }

    res.render("user/payment/index", {
      order: null,
      reservation,
      type: "reservation",
      title: "Thanh Toán Đặt Bàn",
    })
  } catch (error) {
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

router.post("/payment/reservation/:reservationId/confirm", checkAuth, async (req, res) => {
  try {
    const { paymentMethod } = req.body
    if (paymentMethod !== "bank") {
      return res.status(400).render("error", { error: "Đặt bàn trực tuyến chỉ hỗ trợ chuyển khoản", layout: false })
    }

    const reservation = await Reservation.findById(req.params.reservationId)
    if (!reservation) return res.status(404).render("404", { layout: false })
    if (reservation.userId.toString() !== req.session.user.id) {
      return res.status(403).render("error", { error: "Không có quyền truy cập", layout: false })
    }
    if (reservation.paymentStatus === "paid" || await Payment.exists({ reservationId: reservation._id, status: "completed" })) {
      return res.redirect("/user/profile?error=Đặt bàn đã được thanh toán")
    }

    const finalAmount = Math.max(0, Number(reservation.totalAmount) || Number(reservation.depositAmount) || 100000)
    const paidAt = new Date()
    await Payment.create({
      reservationId: reservation._id,
      userId: reservation.userId,
      amount: finalAmount,
      discount: Number(reservation.foodDiscount) || 0,
      finalAmount,
      paymentMethod: "bank",
      status: "completed",
      revenueType: "reception",
      branchId: reservation.branchId || null,
      transactionId: `TXN${Date.now()}${reservation._id.toString().slice(-6)}`,
      paidAt,
    })

    reservation.status = "confirmed"
    reservation.paymentStatus = "paid"
    reservation.paymentMethod = "bank"
    reservation.paidAt = paidAt
    await reservation.save()

    res.redirect("/user/profile?success=Thanh toán đặt bàn thành công!")
  } catch (error) {
    console.error("[restaurant] Reservation payment error:", error)
    res.status(500).render("error", { error: "Không thể xác nhận thanh toán đặt bàn. Vui lòng thử lại.", layout: false })
  }
})

// Guest order history lookup. The response is deliberately generic on failure.
router.get("/track-order", async (req, res) => {
  const limit = getLimit(req)
  res.render("user/track-order", {
    orders: [], order: null, review: null,
    errorMsg: req.query.error || "", success: req.query.success || "",
    remainingAttempts: limit.remaining,
    retryMinutes: Math.ceil(limit.retryAfterMs / 60000),
    title: "Theo Dõi Đơn Hàng",
  })
})

router.post("/track-order", async (req, res) => {
  try {
    const limit = getLimit(req)
    if (limit.locked) {
      return res.status(429).render("user/track-order", {
        orders: [], order: null, review: null,
        errorMsg: `Bạn đã thử quá nhiều lần. Vui lòng thử lại sau ${Math.max(1, Math.ceil(limit.retryAfterMs / 60000))} phút.`,
        success: "", remainingAttempts: 0,
        retryMinutes: Math.max(1, Math.ceil(limit.retryAfterMs / 60000)),
        title: "Theo Dõi Đơn Hàng",
      })
    }

    const phone = normalizePhone(req.body.phone)
    let orders = []
    if (phone) {
      // Include orders placed as a guest with this phone AND orders from any registered
      // account whose phone matches, so the customer sees every order for this number.
      const candidateUsers = await User.find({ phone: { $ne: null } }).select("_id phone")
      const matchedUserIds = candidateUsers
        .filter((u) => u.phone && normalizePhone(u.phone) === phone)
        .map((u) => u._id)
      const orConditions = [{ customerPhoneNormalized: phone }]
      if (matchedUserIds.length) orConditions.push({ userId: { $in: matchedUserIds } })
      orders = await Order.find({ $or: orConditions })
        .populate("shipperId", "name role")
        .populate("staffId", "name role")
        .sort({ createdAt: -1 })
        .limit(50)
    }

    if (!phone || orders.length === 0) {
      const failed = recordFailure(req)
      return res.status(404).render("user/track-order", {
        orders: [], order: null, review: null,
        errorMsg: "Không thể xác minh lịch sử mua hàng với thông tin đã nhập.",
        success: "", remainingAttempts: failed.remaining,
        retryMinutes: Math.ceil(failed.retryAfterMs / 60000),
        title: "Theo Dõi Đơn H��ng",
      })
    }

    clearFailures(req)
    grantGuestAccess(req, phone)
    // Remember every order returned so the customer can open its detail page without
    // being asked to log in, including orders that belong to a registered account.
    req.session.guestOrderIds = [
      ...new Set([...(req.session.guestOrderIds || []), ...orders.map((o) => o._id.toString())]),
    ]
    res.render("user/track-order", {
      orders, order: null, review: null, errorMsg: "",
      success: `Đã tìm thấy ${orders.length} đơn hàng gần đây.`,
      remainingAttempts: 5, retryMinutes: 0,
      title: "Lịch Sử Mua Hàng",
    })
  } catch (error) {
    console.error("[restaurant] Track order error:", error)
    res.status(500).render("error", { error: "Không thể tra cứu đơn hàng", layout: false })
  }
})

router.get("/track-order/:code", async (req, res) => {
  try {
    const order = await Order.findOne({ orderCode: String(req.params.code).toUpperCase() })
      .populate("shipperId", "name role")
      .populate("staffId", "name role")
      .populate("confirmedBy", "name role")
    if (!order) return res.status(404).render("404", { layout: false })

    const ownsOrder = Boolean(req.session.user && order.userId && order.userId.toString() === req.session.user.id)
    const guestOwnsOrder = hasGuestAccess(req, order.customerPhoneNormalized) || (req.session.guestOrderIds || []).includes(order._id.toString())
    if (!ownsOrder && !guestOwnsOrder) return res.redirect("/user/track-order?error=Vui lòng xác minh số điện thoại trước")

    await order.populate("items.productId", "name sku")
    const reviewableProducts = (order.items || [])
      .filter((item) => item.productId)
      .map((item) => ({
        productId: item.productId._id,
        name: item.productId.name || item.name,
        sku: item.productId.sku || "",
      }))
    const reviewOwnerFilter = order.userId
      ? { userId: order.userId }
      : { guestPhoneNormalized: order.customerPhoneNormalized }
    const reviews = reviewableProducts.length
      ? await Review.find({
          ...reviewOwnerFilter,
          productId: { $in: reviewableProducts.map((p) => p.productId) },
        })
      : []
    const reviewsByProduct = {}
    reviews.forEach((r) => { if (r.productId) reviewsByProduct[r.productId.toString()] = r })
    res.render("user/track-order", {
      orders: [], order, reviewableProducts, reviewsByProduct,
      errorMsg: req.query.error || "", success: req.query.success || "",
      remainingAttempts: getLimit(req).remaining, retryMinutes: 0,
      title: `Đơn ${orderCode(order)}`,
    })
  } catch (error) {
    res.status(500).render("error", { error: "Không thể tải đơn hàng", layout: false })
  }
})

router.post("/track-order/:code/review", async (req, res) => {
  try {
    const order = await Order.findOne({ orderCode: String(req.params.code).toUpperCase() })
    if (!order) return res.status(404).render("404", { layout: false })

    const phone = normalizePhone(req.body.phone)
    const ownsOrder = Boolean(req.session.user && order.userId && order.userId.toString() === req.session.user.id)
    const verifiedGuest = phone && phone === order.customerPhoneNormalized
    if (!ownsOrder && !verifiedGuest) {
      return res.redirect(`/user/track-order/${order.orderCode}?error=Số điện thoại hoặc mã đơn không chính xác`)
    }
    if (order.status !== "delivered_success") {
      return res.redirect(`/user/track-order/${order.orderCode}?error=Chỉ có thể đánh giá sau khi giao hàng thành công`)
    }

    const rating = Number(req.body.rating)
    const content = String(req.body.comment || "").trim().slice(0, 1000)
    const productId = String(req.body.productId || "")
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || content.length < 2) {
      return res.redirect(`/user/track-order/${order.orderCode}?error=Vui lòng chọn 1-5 sao và nhập nội dung đánh giá`)
    }

    await order.populate("items.productId", "name sku")
    const orderedItem = (order.items || []).find(
      (item) => item.productId && item.productId._id.toString() === productId
    )
    if (!orderedItem) {
      return res.redirect(`/user/track-order/${order.orderCode}?error=Sản phẩm không thuộc đơn hàng này`)
    }

    const customerName = order.fullName || "Khách hàng"
    const ownerFilter = order.userId
      ? { userId: order.userId }
      : { guestPhoneNormalized: order.customerPhoneNormalized }
    let review = await Review.findOne({ ...ownerFilter, productId })
    if (review) {
      return res.redirect(`/user/track-order/${order.orderCode}?error=Bạn đã đánh giá sản phẩm này rồi`)
    }
    review = new Review({
      orderId: order._id,
      userId: order.userId || null,
      guestPhoneNormalized: order.userId ? null : order.customerPhoneNormalized,
      productId,
      productSku: (orderedItem.productId && orderedItem.productId.sku) || "",
      customerName,
      rating, comment: content, verifiedPurchase: true, status: "approved",
      messages: [{ senderRole: "customer", senderId: order.userId || null, senderName: customerName, content }],
    })
    await review.save()
    if (verifiedGuest) grantGuestAccess(req, phone)
    res.redirect(`/user/track-order/${order.orderCode}?success=Cảm ơn bạn đã đánh giá sản phẩm`)
  } catch (error) {
    console.error("[restaurant] Guest review error:", error)
    res.status(500).render("error", { error: "Không thể lưu đánh giá", layout: false })
  }
})

router.post("/track-order/:code/reply", async (req, res) => {
  try {
    const order = await Order.findOne({ orderCode: String(req.params.code).toUpperCase() })
    if (!order) return res.status(404).render("404", { layout: false })
    const ownsOrder = Boolean(req.session.user && order.userId && order.userId.toString() === req.session.user.id)
    const guestOwnsOrder = hasGuestAccess(req, order.customerPhoneNormalized)
    if (!ownsOrder && !guestOwnsOrder) return res.status(403).render("error", { error: "Không có quyền phản hồi", layout: false })
    const content = String(req.body.content || "").trim().slice(0, 1000)
    if (!content) return res.redirect(`/user/track-order/${order.orderCode}?error=Nội dung phản hồi không được để trống`)
    const ownerFilter = order.userId
      ? { userId: order.userId }
      : { guestPhoneNormalized: order.customerPhoneNormalized }
    const review = await Review.findOne({ ...ownerFilter, productId: String(req.body.productId || "") })
    if (!review) return res.redirect(`/user/track-order/${order.orderCode}?error=Chưa có đánh giá cho sản phẩm này`)
    review.messages.push({ senderRole: "customer", senderId: order.userId || null, senderName: order.fullName || "Khách hàng", content })
    review.updatedAt = new Date()
    await review.save()
    res.redirect(`/user/track-order/${order.orderCode}?success=Đã gửi phản hồi`)
  } catch (error) {
    res.status(500).render("error", { error: "Không thể gửi phản hồi", layout: false })
  }
})

router.get("/orders", checkAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.session.user.id })
      .populate("items.dishId")
      .populate("branchId")
      .populate("shipperId", "name phone")
      .populate("staffId", "name phone")
      .populate("confirmedBy", "name role")
      .sort({ createdAt: -1 })

    res.render("user/orders/index", {
      title: "Don Hang Cua Toi",
      orders,
      message: req.session.message,
    })
    delete req.session.message
  } catch (error) {
    console.error("[restaurant] User orders error:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
})

// Rate an order
router.post("/orders/:id/rate", checkAuth, async (req, res) => {
  try {
    const { rating, ratingComment } = req.body
    const order = await Order.findOne({ _id: req.params.id, userId: req.session.user.id })

    if (!order) {
      req.session.message = { type: "error", text: "Khong tim thay don hang" }
      return res.redirect("/user/orders")
    }

    if (!["completed", "delivered", "delivered_success", "served"].includes(order.status)) {
      req.session.message = { type: "error", text: "Chi co the danh gia don hang da hoan thanh hoac da giao" }
      return res.redirect("/user/orders")
    }

    if (order.rating) {
      req.session.message = { type: "error", text: "Ban da danh gia don hang nay roi" }
      return res.redirect("/user/orders")
    }

    const ratingNum = parseInt(rating)
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      req.session.message = { type: "error", text: "Danh gia phai tu 1 den 5 sao" }
      return res.redirect("/user/orders")
    }

    order.rating = ratingNum
    order.ratingComment = ratingComment || ""
    order.ratedAt = new Date()
    await order.save()

    // Notify admin about the new review
    const ratingLabels = ["", "Rat te", "Khong tot", "Binh thuong", "Tot", "Tuyet voi"]
    const admin = await User.findOne({ role: "admin" })
    if (admin) {
      const notification = new Notification({
        type: "order_review",
        orderId: order._id,
        userId: admin._id,
        amount: 0,
        message: `Khach hang ${req.session.user.name} danh gia ${ratingNum} sao (${ratingLabels[ratingNum]}) cho don #${order._id.toString().slice(-6).toUpperCase()}`,
        details: ratingComment || null,
      })
      await notification.save()
    }

    req.session.message = { type: "success", text: "Danh gia thanh cong! Cam on ban." }
    res.redirect("/user/orders")
  } catch (error) {
    console.error("[restaurant] Rate order error:", error)
    req.session.message = { type: "error", text: "Loi khi danh gia" }
    res.redirect("/user/orders")
  }
})

// Rate a reservation
router.post("/reservations/:id/rate", checkAuth, async (req, res) => {
  try {
    const { rating, ratingComment } = req.body
    const reservation = await Reservation.findOne({ _id: req.params.id, userId: req.session.user.id })

    if (!reservation) {
      return res.redirect("/user/profile?error=Khong tim thay dat ban")
    }

    if (reservation.status !== "completed") {
      return res.redirect("/user/profile?error=Chi co the danh gia dat ban da hoan thanh")
    }

    if (reservation.rating) {
      return res.redirect("/user/profile?error=Ban da danh gia dat ban nay roi")
    }

    const ratingNum = parseInt(rating)
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.redirect("/user/profile?error=Danh gia phai tu 1 den 5 sao")
    }

    reservation.rating = ratingNum
    reservation.ratingComment = ratingComment || ""
    reservation.ratedAt = new Date()
    await reservation.save()

    // Notify admin about the new review
    const ratingLabels = ["", "Rat te", "Khong tot", "Binh thuong", "Tot", "Tuyet voi"]
    const admin = await User.findOne({ role: "admin" })
    if (admin) {
      const notification = new Notification({
        type: "reservation_review",
        userId: admin._id,
        amount: 0,
        message: `Khach hang ${req.session.user.name} danh gia ${ratingNum} sao (${ratingLabels[ratingNum]}) cho dat ban #${reservation._id.toString().slice(-6).toUpperCase()}`,
        details: ratingComment || null,
      })
      await notification.save()
    }

    res.redirect("/user/profile?success=Danh gia thanh cong! Cam on ban.")
  } catch (error) {
    console.error("[restaurant] Rate reservation error:", error)
    res.redirect("/user/profile?error=Loi khi danh gia")
  }
})

function validateReservationDate(date, time) {
  const now = new Date()
  const reservationDateTime = new Date(`${date}T${time}`)

  if (reservationDateTime <= now) {
    return { valid: false, error: "Ngày giờ đặt bàn phải lớn hơn thời gian hiện tại" }
  }
  return { valid: true }
}

function generateQRCode(amount, orderRef, method) {
  if (method === "bank") {
    const bankId = "970422" // MB Bank (you can change this)
    const accountNo = "0123456789" // Replace with real account
    const accountName = "RESTAURANT"
    const content = orderRef

    // VietQR API - generates real QR code for Vietnamese banks
    return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.jpg?amount=${amount}&addInfo=${content}&accountName=${accountName}`
  }

  return null
}

module.exports = router
