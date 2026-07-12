const Warranty = require("../models/Warranty")
const { normalizePhone } = require("../utils/warrantyManager")

exports.getWarranties = async (req, res) => {
  try {
    const statusFilter = req.query.status || ""
    const requestStatus = req.query.requestStatus || ""
    const query = statusFilter ? { status: statusFilter } : {}
    if (requestStatus) query["requests.status"] = requestStatus

    const warranties = await Warranty.find(query)
      .populate("productId", "name image sku brand modelNumber")
      .populate("userId", "name email phone")
      .populate("orderId", "orderCode createdAt")
      .sort({ "requests.requestedAt": -1, createdAt: -1 })

    const now = new Date()
    await Promise.all(warranties.map(async (warranty) => {
      if (warranty.status === "active" && warranty.endDate && now > warranty.endDate) {
        warranty.status = "expired"
        await warranty.save()
      }
    }))

    const [total, active, expired, requested, resolvedRequests] = await Promise.all([
      Warranty.countDocuments(),
      Warranty.countDocuments({ status: "active" }),
      Warranty.countDocuments({ status: "expired" }),
      Warranty.countDocuments({ requests: { $elemMatch: { status: { $in: ["pending", "contacted", "in_progress"] } } } }),
      Warranty.countDocuments({ requests: { $elemMatch: { status: "resolved" } } }),
    ])

    res.render("admin/warranties/index", {
      title: "Quản lý mã bảo hành",
      warranties,
      stats: { total, active, expired, claimed: requested, resolved: resolvedRequests },
      statusFilter,
      requestStatus,
      success: req.query.success,
      error: req.query.error,
    })
  } catch (error) {
    console.error("[restaurant] Error in getWarranties:", error)
    res.status(500).render("error", { error: error.message, layout: false })
  }
}

exports.submitRequest = async (req, res) => {
  try {
    const warrantyCode = String(req.body.warrantyCode || "").trim().toUpperCase()
    const phone = normalizePhone(req.body.phone)
    const issueDescription = String(req.body.issueDescription || "").trim()
    const serviceAddress = String(req.body.serviceAddress || "").trim()

    if (!warrantyCode || !phone || !issueDescription || !serviceAddress) {
      return res.redirect("/contact?warrantyError=Vui lòng nhập đầy đủ thông tin bảo hành#warranty-service")
    }

    const warranty = await Warranty.findOne({ warrantyCode })
    if (!warranty || normalizePhone(warranty.customerPhone) !== phone) {
      return res.redirect("/contact?warrantyError=Mã bảo hành hoặc số điện thoại không chính xác#warranty-service")
    }
    if (warranty.status === "expired" || (warranty.endDate && new Date() > warranty.endDate)) {
      warranty.status = "expired"
      await warranty.save()
      return res.redirect("/contact?warrantyError=Mã bảo hành đã hết hạn#warranty-service")
    }

    warranty.requests.push({ issueDescription, serviceAddress, requestedAt: new Date(), status: "pending" })
    warranty.requestCount = warranty.requests.length
    warranty.status = "claimed"
    warranty.claimedAt = new Date()
    warranty.issueDescription = issueDescription
    await warranty.save()

    res.redirect(`/contact?warrantySuccess=Đã ghi nhận yêu cầu. Mã phiếu ${warranty.warrantyCode}#warranty-service`)
  } catch (error) {
    console.error("[restaurant] Submit warranty request error:", error)
    res.redirect("/contact?warrantyError=Không thể gửi yêu cầu lúc này#warranty-service")
  }
}

exports.updateRequest = async (req, res) => {
  try {
    const { status, adminNotes } = req.body
    const warranty = await Warranty.findById(req.params.id)
    const request = warranty && warranty.requests.id(req.params.requestId)
    if (!warranty || !request) return res.redirect("/admin/warranties?error=Không tìm thấy yêu cầu")

    request.status = ["pending", "contacted", "in_progress", "resolved", "rejected"].includes(status) ? status : request.status
    request.adminNotes = String(adminNotes || "").trim()
    request.resolvedAt = request.status === "resolved" ? new Date() : null
    if (request.status === "resolved" && warranty.requests.every((item) => item._id.equals(request._id) || ["resolved", "rejected"].includes(item.status))) {
      warranty.status = "resolved"
      warranty.resolvedAt = new Date()
    }
    await warranty.save()
    res.redirect("/admin/warranties?success=Đã cập nhật yêu cầu bảo hành")
  } catch (error) {
    console.error("[restaurant] Update warranty request error:", error)
    res.redirect("/admin/warranties?error=Không thể cập nhật yêu cầu")
  }
}

exports.claimWarranty = async (req, res) => res.redirect(`/admin/warranties?error=Yêu cầu bảo hành được gửi từ trang Liên hệ`)

exports.resolveWarranty = async (req, res) => {
  try {
    const warranty = await Warranty.findByIdAndUpdate(req.params.id, { status: "resolved", resolvedAt: new Date(), notes: req.body.notes || "" }, { new: true })
    if (!warranty) return res.redirect("/admin/warranties?error=Không tìm thấy bảo hành")
    res.redirect("/admin/warranties?success=Đã hoàn tất hồ sơ bảo hành")
  } catch (error) {
    res.redirect("/admin/warranties?error=Không thể cập nhật bảo hành")
  }
}

exports.deleteWarranty = async (req, res) => {
  try {
    await Warranty.findByIdAndDelete(req.params.id)
    res.redirect("/admin/warranties?success=Đã xóa mã bảo hành")
  } catch (error) {
    res.redirect("/admin/warranties?error=Không thể xóa mã bảo hành")
  }
}
