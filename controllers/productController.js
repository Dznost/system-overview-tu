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
    const { quantity, isHot, ...productData } = req.body;
    
    const product = new Product({
      ...productData,
      quantity: parseInt(quantity) || 0,
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
    const { quantity, isHot, ...updateData } = req.body;
    
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
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin/products?success=Xóa thành công");
  } catch (error) {
    console.error(error);
    res.redirect("/admin/products");
  }
};
