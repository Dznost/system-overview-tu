const Product = require("../models/Product");
const Event = require("../models/Event");
const Branch = require("../models/Branch");
const inventoryManager = require("../utils/inventoryManager");

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('event')
      .populate('branchInventory.branchId', 'name')
      .sort({ createdAt: -1 });
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
    const branches = await Branch.find().select('name').sort({ name: 1 });
    res.render("admin/products/form", { 
      title: "Thêm Sản Phẩm Mới", 
      product: null, 
      events,
      branches
    });
  } catch (error) {
    console.error(error);
    res.render("admin/products/form", { 
      title: "Thêm Sản Phẩm Mới", 
      product: null, 
      events: [],
      branches: []
    });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const { quantity, branchIds, ...productData } = req.body;
    
    const product = new Product({
      ...productData,
      quantity: parseInt(quantity) || 0,
      branchInventory: []
    });
    
    // If specific branches are selected, initialize branch inventory
    if (branchIds && Array.isArray(branchIds)) {
      for (const branchId of branchIds) {
        product.branchInventory.push({
          branchId,
          quantity: parseInt(quantity) || 0
        });
      }
    }
    
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
    const product = await Product.findById(req.params.id)
      .populate('branchInventory.branchId', 'name');
    const events = await Event.find({ status: 'active' }).sort({ startDate: -1 });
    const branches = await Branch.find().select('name').sort({ name: 1 });
    res.render("admin/products/form", { 
      title: "Chỉnh Sửa Sản Phẩm", 
      product, 
      events,
      branches
    });
  } catch (error) {
    console.error(error);
    res.redirect("/admin/products");
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { quantity, branchIds, ...updateData } = req.body;
    
    if (updateData.event === '') {
      updateData.event = null;
    }
    
    const product = await Product.findById(req.params.id);
    
    // Update global quantity
    if (quantity !== undefined) {
      updateData.quantity = parseInt(quantity);
    }
    
    // Update branch inventory if branchIds provided
    if (branchIds && Array.isArray(branchIds)) {
      const branchIdSet = new Set(branchIds.map(id => id.toString()));
      
      // Remove branches that are no longer selected
      product.branchInventory = product.branchInventory.filter(inv => 
        branchIdSet.has(inv.branchId.toString())
      );
      
      // Add new branches or update existing
      for (const branchId of branchIds) {
        const existing = product.branchInventory.find(inv => 
          inv.branchId.toString() === branchId.toString()
        );
        if (!existing) {
          product.branchInventory.push({
            branchId,
            quantity: parseInt(quantity) || 0
          });
        } else if (quantity !== undefined) {
          existing.quantity = parseInt(quantity);
        }
      }
      
      updateData.branchInventory = product.branchInventory;
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
