const crypto = require("crypto")
const Warranty = require("../models/Warranty")
const Product = require("../models/Product")

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "")
}

function createWarrantyCode(product) {
  const sku = String(product.sku || "GD").replace(/[^A-Z0-9]/gi, "").slice(0, 8).toUpperCase()
  const token = crypto.randomBytes(4).toString("hex").toUpperCase()
  return `BH-${sku}-${token}`
}

async function issueWarrantiesForOrder(order) {
  if (!order || !["delivered_success", "served", "completed"].includes(order.status)) return []

  const issued = []
  for (let itemIndex = 0; itemIndex < (order.items || []).length; itemIndex += 1) {
    const item = order.items[itemIndex]
    if (item.itemType !== "product" || !item.productId) continue

    const product = item.productId.warrantyMonths !== undefined
      ? item.productId
      : await Product.findById(item.productId)
    if (!product || !product.warrantyMonths) continue

    for (let unitIndex = 0; unitIndex < Number(item.quantity || 0); unitIndex += 1) {
      const exists = await Warranty.findOne({ orderId: order._id, orderItemIndex: itemIndex, unitIndex })
      if (exists) {
        issued.push(exists)
        continue
      }

      const warranty = await Warranty.create({
        warrantyCode: createWarrantyCode(product),
        orderId: order._id,
        orderItemIndex: itemIndex,
        unitIndex,
        productId: product._id,
        userId: order.userId || null,
        customerName: order.fullName || order.guestName || "Khách hàng",
        customerPhone: normalizePhone(order.phone || order.guestPhone || order.customerPhoneNormalized),
        warrantyPeriodMonths: product.warrantyMonths,
        startDate: order.deliveredAt || new Date(),
      })
      issued.push(warranty)
    }
  }
  return issued
}

module.exports = { issueWarrantiesForOrder, normalizePhone }
