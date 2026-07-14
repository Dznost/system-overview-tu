const Order = require("../models/Order");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Dish = require("../models/Dish");
const inventoryManager = require("../utils/inventoryManager");
const { appendHistory } = require("../utils/guestOrders");
const { issueWarrantiesForOrder } = require("../utils/warrantyManager");
const { awardLoyaltyForOrder } = require("../utils/loyaltyManager");

async function getActor(req) {
  if (!req.session.user) return { role: "system", name: "Hệ thống" };
  return await User.findById(req.session.user.id).select("name role") || req.session.user;
}

function setStatusMilestone(order, status) {
  const now = new Date();
  if (["approved", "confirmed"].includes(status)) order.confirmedAt = order.confirmedAt || now;
  if (status === "shipped") order.shippingAt = order.shippingAt || now;
  if (status === "delivered_success") order.deliveredAt = order.deliveredAt || now;
}

function canAdminTransition(order, nextStatus) {
  const transitions = {
    pending_approval: ["approved", "cancelled"],
    approved: ["cancelled"],
    assigned_shipper: ["cancelled"],
    confirmed: ["cancelled"],
    delivery_failed: ["approved", "cancelled"],
  };
  return (transitions[order.status] || []).includes(nextStatus);
}

function canAssignOrder(order, targetType) {
  return order.orderType === targetType && order.status === "approved";
}

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const searchQuery = req.query.q || ""
    const statusFilter = req.query.status || ""
    const orderTypeFilter = req.query.orderType || ""
    const branchFilter = req.query.branchId || ""
    const fromDate = req.query.fromDate || ""
    const toDate = req.query.toDate || ""

    let query = {}
    if (statusFilter) query.status = statusFilter
    if (orderTypeFilter) query.orderType = orderTypeFilter
    if (branchFilter) query.branchId = branchFilter

    // Rubric 3.1: Loc don hang theo khoang ngay
    if (fromDate || toDate) {
      query.createdAt = {}
      if (fromDate) query.createdAt.$gte = new Date(fromDate)
      if (toDate) {
        const toDateObj = new Date(toDate)
        toDateObj.setHours(23, 59, 59, 999)
        query.createdAt.$lte = toDateObj
      }
    }

    if (searchQuery) {
      // Search by order code suffix, customer name or phone
      query.$or = [
        { fullName: { $regex: searchQuery, $options: "i" } },
        { phone: { $regex: searchQuery, $options: "i" } },
      ]
    }

    let orders = await Order.find(query)
      .populate("userId", "name email phone")
      .populate("shipperId", "name email phone")
      .populate("staffId", "name email phone role")
      .populate("createdByStaff", "name email phone role")
      .populate("items.dishId", "name price")
      .populate("branchId", "name address")
      .sort({ createdAt: -1 })

    // If search yielded no results, try matching on userId name/phone
    if (searchQuery && orders.length === 0) {
      const User = require("../models/User")
      const matchedUsers = await User.find({
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { phone: { $regex: searchQuery, $options: "i" } },
        ],
      }).select("_id")
      const userIds = matchedUsers.map((u) => u._id)
      const fallbackQuery = Object.assign({}, query)
      delete fallbackQuery.$or
      fallbackQuery.userId = { $in: userIds }
      orders = await Order.find(fallbackQuery)
        .populate("userId", "name email phone")
        .populate("shipperId", "name email phone")
        .populate("staffId", "name email phone role")
        .populate("createdByStaff", "name email phone role")
        .populate("items.dishId", "name price")
        .populate("branchId", "name address")
        .sort({ createdAt: -1 })
    }

    const Branch = require("../models/Branch")
    const branches = await Branch.find().select("name").sort({ name: 1 })

    res.render("admin/orders/index", {
      title: "Quan Ly Don Hang",
      currentPage: "orders",
      orders,
      branches,
      searchQuery,
      statusFilter,
      orderTypeFilter,
      branchFilter,
      fromDate,
      toDate,
      success: req.query.success,
    })
  } catch (error) {
    console.error("[restaurant] Error in getOrders:", error)
    res.redirect("/admin")
  }
}

// Get order detail
exports.getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email phone createdAt")
      .populate("shipperId", "name email phone branchId")
      .populate("staffId", "name email phone role branchId")
      .populate("confirmedBy", "name email phone role")
      .populate("createdByStaff", "name email phone role")
      .populate("items.dishId", "name price discount")
      .populate("branchId", "name address phone");

    if (!order) {
      return res.redirect("/admin/orders");
    }

    const orderObj = order.toObject();
    orderObj.user = orderObj.userId;

    const payment = await Payment.findOne({ orderId: req.params.id });

    // Customer stats
    let customerStats = null;
    if (order.userId) {
      const [totalOrders, totalSpent, recentOrders] = await Promise.all([
        Order.countDocuments({ userId: order.userId._id }),
        Payment.aggregate([
          { $match: { userId: order.userId._id, status: "completed" } },
          { $group: { _id: null, total: { $sum: "$finalAmount" } } },
        ]),
        Order.find({ userId: order.userId._id, _id: { $ne: order._id } })
          .select("_id status totalPrice createdAt orderType")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);
      customerStats = {
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0,
        recentOrders,
        memberSince: order.userId.createdAt,
      };
    }

    // Prefer immutable status history; infer a minimal history for legacy orders.
    const timeline = (order.statusHistory || []).map((entry) => ({
      event: entry.note || entry.status,
      time: entry.timestamp,
      status: entry.status,
      actorName: entry.actorName,
      actorRole: entry.actorRole,
    }));
    if (timeline.length === 0) timeline.push({ event: "Đơn hàng được tạo", time: order.createdAt, status: "created" });
    if (order.paidAt) timeline.push({ event: "Thanh toán thành công", time: order.paidAt, status: "paid" });
    timeline.sort((a, b) => new Date(a.time) - new Date(b.time));

    // Get all shippers for assignment (no branch filter)
    const shippers = await User.find({ role: "shipper" }).select("name email phone").sort({ _id: 1 });

    // Get all staff and reception for dine-in assignment
    const staffMembers = await User.find({ role: { $in: ["staff", "reception"] } }).select("name email phone role").sort({ _id: 1 });

    res.render("admin/orders/detail", {
      title: "Chi Tiet Don Hang",
      order: orderObj,
      payment,
      shippers,
      staffMembers,
      customerStats,
      timeline,
      success: req.query.success || null,
    });
  } catch (error) {
    console.error("[restaurant] Error in getOrderDetail:", error);
    res.redirect("/admin/orders");
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    console.log("[restaurant] Updating order status:", req.params.id, status);
    
    const order = await Order.findById(req.params.id);
    if (!order) return res.redirect("/admin/orders");
    if (!canAdminTransition(order, status)) {
      return res.redirect(`/admin/orders/${req.params.id}?success=Chuyển trạng thái không hợp lệ`);
    }
    const actor = await getActor(req);
    order.status = status;
    setStatusMilestone(order, status);
    if (["approved", "confirmed"].includes(status)) order.confirmedBy = actor._id || null;
    appendHistory(order, { status, actor, note: `Trạng thái được cập nhật thành ${status}.` });
    await order.save();
    
    res.redirect(`/admin/orders/${req.params.id}?success=Cập nhật thành công`);
  } catch (error) {
    console.error("[restaurant] Error in updateOrderStatus:", error);
    res.redirect("/admin/orders");
  }
};

// Complete COD payment
exports.completeCODPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.dishId").populate("items.productId");
    
    if (order && order.paymentTiming === "cod" && order.paymentStatus !== "paid") {
      const payment = new Payment({
        orderId: order._id,
        userId: order.userId,
        amount: order.finalPrice || order.totalPrice,
        discount: order.discount || 0,
        finalAmount: order.finalPrice || order.totalPrice,
        paymentMethod: "cash",
        status: "completed",
        revenueType: order.orderType === "dine-in" ? "reception" : "delivery",
        branchId: order.branchId || null,
        collectedBy: order.shipperId || order.staffId || null,
        paidAt: new Date()
      });
      await payment.save();
      
      order.paymentStatus = "paid";
      order.status = order.orderType === "takeaway" ? "delivered_success" : "served";
      order.paidAt = new Date();
      order.deliveredAt = order.orderType === "takeaway" ? order.paidAt : order.deliveredAt;
      appendHistory(order, {
        status: order.status,
        actor: await getActor(req),
        note: order.orderType === "takeaway" ? "Đã giao hàng và thu tiền COD thành công." : "Đơn hàng đã hoàn tất phục vụ.",
      });
      await order.save();
      await issueWarrantiesForOrder(order);
      await awardLoyaltyForOrder(order);
      
      // Increment order count for each item in the completed order
      for (const item of order.items) {
        if (item.itemType === "dish" && item.dishId) {
          await inventoryManager.incrementOrderCount(item.dishId._id);
        } else if (item.itemType === "product" && item.productId) {
          await inventoryManager.incrementProductOrderCount(item.productId._id);
        }
      }
      
      console.log("[restaurant] COD payment completed for order:", order._id);
    }
    
    res.redirect(`/admin/orders/${req.params.id}?success=Xác nhận thanh toán thành công`);
  } catch (error) {
    console.error("[restaurant] Error in completeCODPayment:", error);
    res.redirect("/admin/orders");
  }
};

// Assign order to shipper
exports.assignToShipper = async (req, res) => {
  try {
    const { shipperId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.redirect("/admin/orders");
    }
    if (!canAssignOrder(order, "takeaway")) {
      return res.redirect(`/admin/orders/${req.params.id}?success=Chỉ phân công đơn giao hàng đã được duyệt`);
    }

    // Verify shipper exists and has shipper role
    const shipper = await User.findOne({ _id: shipperId, role: "shipper" });
    if (!shipper) {
      return res.redirect(`/admin/orders/${req.params.id}?success=Shipper khong hop le`);
    }

    order.shipperId = shipperId;
    order.assignedShipperId = shipperId;
    order.assignedAt = new Date();
    order.status = "assigned_shipper";
    appendHistory(order, {
      status: "assigned_shipper",
      actor: await getActor(req),
      note: `Đã chuyển đơn cho shipper ${shipper.name}.`,
    });
    await order.save();

    // Create notification for shipper
    const notification = new Notification({
      type: "order_assigned",
      orderId: order._id,
      userId: shipperId,
      amount: order.finalPrice || order.totalPrice,
      message: `Ban duoc giao don hang #${order._id.toString().slice(-6).toUpperCase()} - ${(order.finalPrice || order.totalPrice).toLocaleString('vi-VN')}d`,
    });
    await notification.save();

    console.log("[restaurant] Order assigned to shipper:", order._id, "->", shipperId);
    res.redirect(`/admin/orders/${req.params.id}?success=Da gui don hang cho shipper`);
  } catch (error) {
    console.error("[restaurant] Error in assignToShipper:", error);
    res.redirect("/admin/orders");
  }
};

// Assign dine-in order to staff or reception
exports.assignToStaff = async (req, res) => {
  try {
    const { staffId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.redirect("/admin/orders");
    }
    if (!canAssignOrder(order, "dine-in")) {
      return res.redirect(`/admin/orders/${req.params.id}?success=Chỉ phân công đơn tại quán đã được duyệt`);
    }

    const staff = await User.findOne({ _id: staffId, role: { $in: ["staff", "reception"] } });
    if (!staff) {
      return res.redirect(`/admin/orders/${req.params.id}?success=Nhan vien khong hop le`);
    }

    order.staffId = staffId;
    order.assignedAt = new Date();
    order.status = "confirmed";
    appendHistory(order, {
      status: "confirmed",
      actor: await getActor(req),
      note: `Đã chuyển đơn cho ${staff.role === "reception" ? "lễ tân" : "nhân viên"} ${staff.name}.`,
    });
    await order.save();

    const roleLabel = staff.role === "reception" ? "le tan" : "nhan vien";
    const notification = new Notification({
      type: "order_assigned",
      orderId: order._id,
      userId: staffId,
      amount: order.finalPrice || order.totalPrice,
      message: `Ban duoc giao don an tai quan #${order._id.toString().slice(-6).toUpperCase()} - ${(order.finalPrice || order.totalPrice).toLocaleString('vi-VN')}d`,
    });
    await notification.save();

    console.log("[restaurant] Order assigned to", roleLabel, ":", order._id, "->", staffId);
    res.redirect(`/admin/orders/${req.params.id}?success=Da gui don hang cho ${roleLabel}`);
  } catch (error) {
    console.error("[restaurant] Error in assignToStaff:", error);
    res.redirect("/admin/orders");
  }
};

// Auto-assign dine-in order to staff (round-robin by _id)
exports.autoAssignToStaff = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.redirect("/admin/orders");
    }
    if (!canAssignOrder(order, "dine-in")) {
      return res.redirect(`/admin/orders/${req.params.id}?success=Chỉ phân công đơn tại quán đã được duyệt`);
    }

    // Get all staff sorted by _id ascending
    var staffMembers = await User.find({ role: "staff" }).select("name").sort({ _id: 1 });

    if (staffMembers.length === 0) {
      return res.redirect(`/admin/orders/${req.params.id}?success=Khong co nhan vien nao trong he thong`);
    }

    // Find the last dine-in order assigned to staff
    var lastAssigned = await Order.findOne({ staffId: { $ne: null }, orderType: "dine-in" }).sort({ createdAt: -1 }).select("staffId");

    var selectedIndex = 0;
    if (lastAssigned && lastAssigned.staffId) {
      var lastIdx = staffMembers.findIndex(function(s) { return s._id.toString() === lastAssigned.staffId.toString(); });
      if (lastIdx !== -1) {
        selectedIndex = (lastIdx + 1) % staffMembers.length;
      }
    }

    var selectedStaff = staffMembers[selectedIndex];

    order.staffId = selectedStaff._id;
    order.assignedAt = new Date();
    order.status = "confirmed";
    appendHistory(order, { status: "confirmed", actor: await getActor(req), note: `Đã tự động chuyển đơn cho nhân viên ${selectedStaff.name}.` });
    await order.save();

    var notification = new Notification({
      type: "order_assigned",
      orderId: order._id,
      userId: selectedStaff._id,
      amount: order.finalPrice || order.totalPrice,
      message: `Ban duoc tu dong giao don an tai quan #${order._id.toString().slice(-6).toUpperCase()} - ${(order.finalPrice || order.totalPrice).toLocaleString('vi-VN')}d`,
    });
    await notification.save();

    console.log("[restaurant] Auto-assigned dine-in order", order._id, "to staff", selectedStaff.name);
    res.redirect(`/admin/orders/${req.params.id}?success=Da tu dong gan cho nhan vien ${selectedStaff.name}`);
  } catch (error) {
    console.error("[restaurant] Error in autoAssignToStaff:", error);
    res.redirect("/admin/orders");
  }
};

// Cancel order and restore inventory
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.dishId");
    
    if (!order) {
      return res.redirect("/admin/orders");
    }
    
    if (order.status === "cancelled") {
      return res.redirect(`/admin/orders/${req.params.id}?success=Don hang da huy truoc do`);
    }
    
    // Rubric 1.1: Huy don hang thi so luong duoc cong len (ca mon an va san pham)
    for (const item of order.items) {
      if (item.itemType === "dish" && item.dishId) {
        await inventoryManager.incrementQuantity(
          item.dishId._id || item.dishId,
          order.branchId,
          item.quantity
        );
      } else if (item.itemType === "product" && item.productId) {
        await inventoryManager.incrementProductQuantity(
          item.productId._id || item.productId,
          order.branchId,
          item.quantity
        );
      }
    }
    
    order.status = "cancelled";
    await order.save();
    
    console.log("[restaurant] Order cancelled and inventory restored:", order._id);
    res.redirect(`/admin/orders/${req.params.id}?success=Don hang da huy va hang ton kho da phuc hoi`);
  } catch (error) {
    console.error("[restaurant] Error in cancelOrder:", error);
    res.redirect("/admin/orders");
  }
};

// Auto-assign order to shipper (round-robin by _id, low to high, cycle back)
exports.autoAssignToShipper = async (req, res) => {
  try {
  const order = await Order.findById(req.params.id);
  if (!order) {
  return res.redirect("/admin/orders");
  }
  if (!canAssignOrder(order, "takeaway")) {
  return res.redirect(`/admin/orders/${req.params.id}?success=Chỉ phân công đơn giao hàng đã được duyệt`);
  }
  
  // Get all shippers sorted by _id ascending
    var shippers = await User.find({ role: "shipper" }).select("name").sort({ _id: 1 });

    if (shippers.length === 0) {
      return res.redirect(`/admin/orders/${req.params.id}?success=Khong co shipper nao trong he thong`);
    }

    // Find the last takeaway order assigned to a shipper
    var lastAssigned = await Order.findOne({ shipperId: { $ne: null }, orderType: "takeaway" }).sort({ createdAt: -1 }).select("shipperId");

    var selectedIndex = 0;
    if (lastAssigned && lastAssigned.shipperId) {
      var lastIdx = shippers.findIndex(function(s) { return s._id.toString() === lastAssigned.shipperId.toString(); });
      if (lastIdx !== -1) {
        selectedIndex = (lastIdx + 1) % shippers.length;
      }
    }

    var selectedShipper = shippers[selectedIndex];

    order.shipperId = selectedShipper._id;
    order.assignedShipperId = selectedShipper._id;
    order.assignedAt = new Date();
    order.status = "assigned_shipper";
    appendHistory(order, { status: "assigned_shipper", actor: await getActor(req), note: `Đã tự động chuyển đơn cho shipper ${selectedShipper.name}.` });
    await order.save();

    var notification = new Notification({
      type: "order_assigned",
      orderId: order._id,
      userId: selectedShipper._id,
      amount: order.finalPrice || order.totalPrice,
      message: `Ban duoc tu dong giao don hang #${order._id.toString().slice(-6).toUpperCase()} - ${(order.finalPrice || order.totalPrice).toLocaleString('vi-VN')}d`,
    });
    await notification.save();

    console.log("[restaurant] Auto-assigned order", order._id, "to shipper", selectedShipper.name);
    res.redirect(`/admin/orders/${req.params.id}?success=Da tu dong gan cho shipper ${selectedShipper.name}`);
  } catch (error) {
    console.error("[restaurant] Error in autoAssignToShipper:", error);
    res.redirect("/admin/orders");
  }
};
