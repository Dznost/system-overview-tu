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
      events
    });
  } catch (error) {
    console.error(error);
    res.render("admin/products/form", { 
      title: "Thêm Sản Phẩm Mới", 
      product: null, 
      events: []
    });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const { quantity, warrantyMonths, isHot, ...productData } = req.body;
    productData.sku = String(productData.sku || "").trim().toUpperCase();
    productData.productType = "home-appliance";
    
    const product = new Product({
      ...productData,
      quantity: Math.max(0, parseInt(quantity, 10) || 0),
      warrantyMonths: Math.max(0, parseInt(warrantyMonths, 10) || 0),
      isHot: isHot === 'on' || isHot === true,
      isAutoHot: false
    });
    
    await product.save();
    res.redirect("/admin/products?success=Thêm sản phẩm thành công");
  } catch (error) {
    console.error(error);
    res.redirect("/admin/products");
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
      events
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
    
    if (updateData.event === '') {
      updateData.event = null;
    }
    
    // Update global quantity
    if (quantity !== undefined) {
      updateData.quantity = parseInt(quantity);
    }
    
    // Handle isHot flag (only manual setting, not auto)
    if (isHot !== undefined) {
      updateData.isHot = isHot === 'on' || isHot === true;
      // If manually setting to true, mark as not auto-promoted
      if (updateData.isHot) {
        updateData.isAutoHot = false;
      }
    }
    
    await Product.findByIdAndUpdate(req.params.id, updateData);
    res.redirect("/admin/products?success=Cập nhật thành công");
  } catch (error) {
    console.error(error);
    res.redirect("/admin/products");
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
