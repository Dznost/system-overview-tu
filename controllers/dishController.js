const Dish = require("../models/Dish");
const Event = require("../models/Event");
const Branch = require("../models/Branch");
const inventoryManager = require("../utils/inventoryManager");

// Get all dishes
exports.getDishes = async (req, res) => {
  try {
    const dishes = await Dish.find()
      .populate('event')
      .populate('branchInventory.branchId', 'name')
      .sort({ createdAt: -1 });
    res.render("admin/dishes/index", { 
      title: "Quản Lý Món Ăn", 
      dishes,
      success: req.query.success 
    });
  } catch (error) {
    console.error(error);
    res.redirect("/admin");
  }
};

// Get new dish form
exports.getNewDishForm = async (req, res) => {
  try {
    const events = await Event.find({ status: 'active' }).sort({ startDate: -1 });
    const branches = await Branch.find().select('name').sort({ name: 1 });
    res.render("admin/dishes/form", { 
      title: "Thêm Món Ăn Mới", 
      dish: null, 
      events,
      branches
    });
  } catch (error) {
    console.error(error);
    res.render("admin/dishes/form", { 
      title: "Thêm Món Ăn Mới", 
      dish: null, 
      events: [],
      branches: []
    });
  }
};

// Create new dish
exports.createDish = async (req, res) => {
  try {
    const { quantity, branchIds, ...dishData } = req.body;
    
    const dish = new Dish({
      ...dishData,
      quantity: parseInt(quantity) || 0,
      branchInventory: []
    });
    
    // If specific branches are selected, initialize branch inventory
    if (branchIds && Array.isArray(branchIds)) {
      for (const branchId of branchIds) {
        dish.branchInventory.push({
          branchId,
          quantity: parseInt(quantity) || 0
        });
      }
    }
    
    await dish.save();
    res.redirect("/admin/dishes?success=Thêm món ăn thành công");
  } catch (error) {
    console.error(error);
    res.redirect("/admin/dishes");
  }
};

// Get edit dish form
exports.getEditDishForm = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id)
      .populate('branchInventory.branchId', 'name');
    const events = await Event.find({ status: 'active' }).sort({ startDate: -1 });
    const branches = await Branch.find().select('name').sort({ name: 1 });
    res.render("admin/dishes/form", { 
      title: "Chỉnh Sửa Món Ăn", 
      dish, 
      events,
      branches
    });
  } catch (error) {
    console.error(error);
    res.redirect("/admin/dishes");
  }
};

// Update dish
exports.updateDish = async (req, res) => {
  try {
    const { quantity, branchIds, ...updateData } = req.body;
    
    if (updateData.event === '') {
      updateData.event = null;
    }
    
    const dish = await Dish.findById(req.params.id);
    
    // Update global quantity
    if (quantity !== undefined) {
      updateData.quantity = parseInt(quantity);
    }
    
    // Update branch inventory if branchIds provided
    if (branchIds && Array.isArray(branchIds)) {
      const branchIdSet = new Set(branchIds.map(id => id.toString()));
      
      // Remove branches that are no longer selected
      dish.branchInventory = dish.branchInventory.filter(inv => 
        branchIdSet.has(inv.branchId.toString())
      );
      
      // Add new branches or update existing
      for (const branchId of branchIds) {
        const existing = dish.branchInventory.find(inv => 
          inv.branchId.toString() === branchId.toString()
        );
        if (!existing) {
          dish.branchInventory.push({
            branchId,
            quantity: parseInt(quantity) || 0
          });
        } else if (quantity !== undefined) {
          existing.quantity = parseInt(quantity);
        }
      }
      
      updateData.branchInventory = dish.branchInventory;
    }
    
    await Dish.findByIdAndUpdate(req.params.id, updateData);
    res.redirect("/admin/dishes?success=Cập nhật thành công");
  } catch (error) {
    console.error(error);
    res.redirect("/admin/dishes");
  }
};

// Delete dish
exports.deleteDish = async (req, res) => {
  try {
    await Dish.findByIdAndDelete(req.params.id);
    res.redirect("/admin/dishes?success=Xóa thành công");
  } catch (error) {
    console.error(error);
    res.redirect("/admin/dishes");
  }
};
