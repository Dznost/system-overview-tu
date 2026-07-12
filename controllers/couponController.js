const Coupon = require("../models/Coupon")

function normalizeApplicableTo(value) {
  const aliases = { all: "all", dish: "dishes", dishes: "dishes", product: "products", products: "products" }
  const values = Array.isArray(value) ? value : String(value || "all").split(",")
  const normalized = [...new Set(values.map((item) => aliases[String(item).trim().toLowerCase()]).filter(Boolean))]
  return normalized.length ? normalized : ["all"]
}

function buildCouponData(body, userId) {
  const discountValue = Number(body.discountValue)
  const validFrom = new Date(body.validFrom)
  const validUntil = new Date(body.validUntil)
  const maxUses = Number(body.maxUses)
  const minOrderAmount = Number(body.minOrderAmount ?? body.minOrderValue ?? 0)

  if (!body.code?.trim()) throw new Error("Vui lòng nhập mã giảm giá")
  if (!["percentage", "fixed_amount"].includes(body.discountType)) throw new Error("Loại giảm giá không hợp lệ")
  if (!Number.isFinite(discountValue) || discountValue <= 0) throw new Error("Giá trị giảm phải lớn hơn 0")
  if (body.discountType === "percentage" && discountValue > 100) throw new Error("Mức giảm phần trăm không được vượt quá 100%")
  if (Number.isNaN(validFrom.getTime()) || Number.isNaN(validUntil.getTime()) || validUntil <= validFrom) {
    throw new Error("Ngày kết thúc phải sau ngày bắt đầu")
  }
  if (!Number.isInteger(maxUses) || maxUses < 1) throw new Error("Số lượt sử dụng phải là số nguyên dương")
  if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) throw new Error("Giá trị đơn tối thiểu không hợp lệ")

  return {
    code: body.code.trim().toUpperCase(),
    description: body.description?.trim() || "",
    discountType: body.discountType,
    discountValue,
    minOrderAmount,
    maxUses,
    validFrom,
    validUntil,
    applicableTo: normalizeApplicableTo(body.applicableTo),
    createdBy: userId,
    isActive: body.isActive === undefined ? true : ["on", "true", "1"].includes(String(body.isActive)),
  }
}

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 })
    res.render("admin/coupons/index", {
      title: "Quản Lý Mã Giảm Giá",
      coupons,
      currentDate: new Date(),
      success: req.query.success,
      error: req.query.error,
    })
  } catch (error) {
    res.status(500).render("error", { error: error.message })
  }
}

exports.getNewCouponForm = (req, res) => res.render("admin/coupons/form", {
  title: "Thêm Mã Giảm Giá Mới",
  coupon: null,
  error: req.query.error,
})

exports.createCoupon = async (req, res) => {
  try {
    const data = buildCouponData(req.body, req.session.user.id)
    if (await Coupon.exists({ code: data.code })) throw new Error(`Mã giảm giá ${data.code} đã tồn tại`)
    await Coupon.create(data)
    res.redirect("/admin/coupons?success=Thêm mã giảm giá thành công")
  } catch (error) {
    res.redirect(`/admin/coupons/new?error=${encodeURIComponent(error.message)}`)
  }
}

exports.getEditCouponForm = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
    if (!coupon) return res.redirect("/admin/coupons?error=Không tìm thấy mã giảm giá")
    res.render("admin/coupons/form", { title: "Chỉnh Sửa Mã Giảm Giá", coupon, error: req.query.error })
  } catch (error) {
    res.redirect("/admin/coupons?error=Không thể tải mã giảm giá")
  }
}

exports.updateCoupon = async (req, res) => {
  try {
    const data = buildCouponData(req.body, req.session.user.id)
    const duplicate = await Coupon.exists({ code: data.code, _id: { $ne: req.params.id } })
    if (duplicate) throw new Error(`Mã giảm giá ${data.code} đã tồn tại`)
    delete data.createdBy
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
    if (!coupon) return res.redirect("/admin/coupons?error=Không tìm thấy mã giảm giá")
    res.redirect("/admin/coupons?success=Cập nhật mã giảm giá thành công")
  } catch (error) {
    res.redirect(`/admin/coupons/${req.params.id}/edit?error=${encodeURIComponent(error.message)}`)
  }
}

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id)
    if (!coupon) return res.redirect("/admin/coupons?error=Không tìm thấy mã giảm giá")
    res.redirect("/admin/coupons?success=Xóa mã giảm giá thành công")
  } catch (error) {
    res.redirect("/admin/coupons?error=Không thể xóa mã giảm giá")
  }
}

exports.validateCoupon = async (req, res) => {
  try {
    const orderTotal = Number(req.body.orderTotal)
    const coupon = await Coupon.findOne({ code: String(req.body.code || "").trim().toUpperCase() })
    if (!coupon || !coupon.isValid()) return res.json({ valid: false, message: "Mã giảm giá không hợp lệ hoặc đã hết hạn" })
    if (!Number.isFinite(orderTotal) || orderTotal < coupon.minOrderAmount) {
      return res.json({ valid: false, message: `Đơn hàng tối thiểu ${coupon.minOrderAmount.toLocaleString("vi-VN")}đ` })
    }
    const rawDiscount = coupon.discountType === "percentage"
      ? Math.round(orderTotal * coupon.discountValue / 100)
      : coupon.discountValue
    const discount = Math.min(orderTotal, rawDiscount)
    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
      finalAmount: Math.max(0, orderTotal - discount),
      description: coupon.description,
    })
  } catch (error) {
    res.json({ valid: false, message: "Không thể kiểm tra mã giảm giá" })
  }
}

module.exports = exports
