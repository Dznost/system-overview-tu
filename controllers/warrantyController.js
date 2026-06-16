const Warranty = require("../models/Warranty");

// Get all warranties (admin)
exports.getWarranties = async (req, res) => {
  try {
    const statusFilter = req.query.status || "";

    const query = {};
    if (statusFilter) query.status = statusFilter;

    const warranties = await Warranty.find(query)
      .populate("productId", "name image")
      .populate("userId", "name email phone")
      .populate("orderId")
      .sort({ createdAt: -1 });

    const now = new Date();
    // Auto-expire warranties past their end date
    for (const w of warranties) {
      if (w.status === "active" && w.endDate && now > w.endDate) {
        w.status = "expired";
        await w.save();
      }
    }

    const stats = {
      total: await Warranty.countDocuments(),
      active: await Warranty.countDocuments({ status: "active" }),
      claimed: await Warranty.countDocuments({ status: "claimed" }),
      expired: await Warranty.countDocuments({ status: "expired" }),
      resolved: await Warranty.countDocuments({ status: "resolved" }),
    };

    res.render("admin/warranties/index", {
      title: "Quan Ly Bao Hanh",
      warranties,
      stats,
      statusFilter,
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.error("[restaurant] Error in getWarranties:", error);
    res.status(500).render("error", { error: error.message, layout: false });
  }
};

// Mark a warranty as claimed
exports.claimWarranty = async (req, res) => {
  try {
    const { issueDescription } = req.body;
    const warranty = await Warranty.findByIdAndUpdate(
      req.params.id,
      { status: "claimed", claimedAt: new Date(), issueDescription: issueDescription || "" },
      { new: true }
    );
    if (!warranty) return res.redirect("/admin/warranties?error=Khong tim thay bao hanh");
    res.redirect("/admin/warranties?success=Da ghi nhan yeu cau bao hanh");
  } catch (error) {
    console.error("[restaurant] Error in claimWarranty:", error);
    res.redirect("/admin/warranties?error=Co loi khi cap nhat bao hanh");
  }
};

// Mark a warranty as resolved
exports.resolveWarranty = async (req, res) => {
  try {
    const { notes } = req.body;
    const warranty = await Warranty.findByIdAndUpdate(
      req.params.id,
      { status: "resolved", resolvedAt: new Date(), notes: notes || "" },
      { new: true }
    );
    if (!warranty) return res.redirect("/admin/warranties?error=Khong tim thay bao hanh");
    res.redirect("/admin/warranties?success=Da xu ly bao hanh thanh cong");
  } catch (error) {
    console.error("[restaurant] Error in resolveWarranty:", error);
    res.redirect("/admin/warranties?error=Co loi khi cap nhat bao hanh");
  }
};

// Delete warranty
exports.deleteWarranty = async (req, res) => {
  try {
    await Warranty.findByIdAndDelete(req.params.id);
    res.redirect("/admin/warranties?success=Da xoa bao hanh");
  } catch (error) {
    console.error("[restaurant] Error in deleteWarranty:", error);
    res.redirect("/admin/warranties?error=Co loi khi xoa");
  }
};

module.exports = exports;
