const Product = require("../models/Product");
const Event = require("../models/Event");
const inventoryManager = require("../utils/inventoryManager");

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('event')
      .sort({ isHot: -1, createdAt: -1 });
    res.render("admin/products/index", { 
      title: "Quản Lý Sản Phẩm", 
      products,
      success: req.query.success 
    });
  } catch (error) {
    console.error(error);
    res.redirect("/admin");
  }
};

// Get new product form
exports.getNewProductForm = async (req, res) => {
  try {
    const events = await Event.find({ status: 'active' }).sort({ startDate: -1 });
    res.render("admin/products/form", { 
      title: "Thêm Sản Phẩm Mới", 
      product: null, 
      events,
      error: req.query.error || ""
    });
  } catch (error) {
    console.error(error);
    res.render("admin/products/form", { 
      title: "Thêm Sản Phẩm Mới", 
      product: null, 
      events: [],
      error: req.query.error || ""
    });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const { quantity, warrantyMonths, isHot, event, price, discount, ...productData } = req.body;
    productData.sku = String(productData.sku || "").trim().toUpperCase();
    productData.productType = "home-appliance";

    if (!String(productData.name || "").trim()) throw new Error("Vui lòng nhập tên sản phẩm");
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) throw new Error("Giá sản phẩm không hợp lệ");
    if (productData.sku && (await Product.exists({ sku: productData.sku }))) {
      throw new Error(`Mã SKU ${productData.sku} đã tồn tại`);
    }

    const product = new Product({
      ...productData,
      price: priceNum,
      discount: Math.min(100, Math.max(0, parseInt(discount, 10) || 0)),
      // Empty <select> value must become null, never an empty string (ObjectId cast error).
      event: event ? event : null,
      quantity: Math.max(0, parseInt(quantity, 10) || 0),
      warrantyMonths: Math.max(0, parseInt(warrantyMonths, 10) || 0),
      isHot: isHot === 'on' || isHot === true,
      isAutoHot: false
    });

    await product.save();
    res.redirect("/admin/products?success=Thêm sản phẩm thành công");
  } catch (error) {
    console.error("[restaurant] Create product error:", error);
    const message = error && error.code === 11000 ? "Mã SKU đã tồn tại" : (error.message || "Không thể thêm sản phẩm");
    res.redirect(`/admin/products/new?error=${encodeURIComponent(message)}`);
  }
};

// Get edit product form
exports.getEditProductForm = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const events = await Event.find({ status: 'active' }).sort({ startDate: -1 });
    res.render("admin/products/form", { 
      title: "Chỉnh Sửa Sản Phẩm", 
      product, 
      events,
      error: req.query.error || ""
    });
  } catch (error) {
    console.error(error);
    res.redirect("/admin/products");
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { quantity, warrantyMonths, isHot, ...updateData } = req.body;
    updateData.sku = String(updateData.sku || "").trim().toUpperCase();
    updateData.productType = "home-appliance";
    updateData.warrantyMonths = Math.max(0, parseInt(warrantyMonths, 10) || 0);

    if (updateData.price !== undefined) {
      const priceNum = Number(updateData.price);
      if (!Number.isFinite(priceNum) || priceNum < 0) throw new Error("Giá sản phẩm không hợp lệ");
      updateData.price = priceNum;
    }
    if (updateData.discount !== undefined) {
      updateData.discount = Math.min(100, Math.max(0, parseInt(updateData.discount, 10) || 0));
    }
    if (updateData.sku && (await Product.exists({ sku: updateData.sku, _id: { $ne: req.params.id } }))) {
      throw new Error(`Mã SKU ${updateData.sku} đã tồn tại`);
    }

    // Empty <select> value must become null, never an empty string (ObjectId cast error).
    if (!updateData.event) {
      updateData.event = null;
    }
    
    // Update global quantity
    if (quantity !== undefined) {
      updateData.quantity = Math.max(0, parseInt(quantity, 10) || 0);
    }
    
    // Handle isHot flag (only manual setting, not auto)
    if (isHot !== undefined) {
      updateData.isHot = isHot === 'on' || isHot === true;
      // If manually setting to true, mark as not auto-promoted
      if (updateData.isHot) {
        updateData.isAutoHot = false;
      }
    }
    
    await Product.findByIdAndUpdate(req.params.id, updateData, { runValidators: true });
    res.redirect("/admin/products?success=Cập nhật thành công");
  } catch (error) {
    console.error("[restaurant] Update product error:", error);
    const message = error && error.code === 11000 ? "Mã SKU đã tồn tại" : (error.message || "Không thể cập nhật sản phẩm");
    res.redirect(`/admin/products/${req.params.id}/edit?error=${encodeURIComponent(message)}`);
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const Order = require("../models/Order");
    const Warranty = require("../models/Warranty");
    const hasSales = await Order.exists({ "items.productId": req.params.id });
    const hasWarranties = await Warranty.exists({ productId: req.params.id });

    if (hasSales || hasWarranties) {
      await Product.findByIdAndUpdate(req.params.id, { isActive: false, available: false });
      return res.redirect("/admin/products?success=Sản phẩm đã phát sinh giao dịch nên được chuyển sang ngừng bán thay vì xóa");
    }

    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin/products?success=Xóa sản phẩm thành công");
  } catch (error) {
    console.error(error);
    res.redirect("/admin/products?error=Không thể xóa sản phẩm");
  }
};
