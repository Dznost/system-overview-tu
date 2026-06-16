const QA = require("../models/QA");
const User = require("../models/User");
const Dish = require("../models/Dish");
const Product = require("../models/Product");

// Get all Q&A (admin)
exports.getQA = async (req, res) => {
  try {
    const statusFilter = req.query.status || "";
    const itemTypeFilter = req.query.itemType || "";

    let query = {};

    if (statusFilter) {
      query.status = statusFilter;
    }

    if (itemTypeFilter) {
      query.itemType = itemTypeFilter;
    }

    const questions = await QA.find(query)
      .populate("userId", "name email")
      .populate("itemId", "name")
      .populate("answeredBy", "name email")
      .sort({ createdAt: -1 });

    res.render("admin/qa/index", {
      title: "Quan Ly Hoi Dap",
      questions,
      statusFilter,
      itemTypeFilter,
      success: req.query.success,
    });
  } catch (error) {
    console.error("[restaurant] Error in getQA:", error);
    res.status(500).render("error", { error: error.message });
  }
};

// Answer question
exports.answerQuestion = async (req, res) => {
  try {
    const { answer } = req.body;

    if (!answer || answer.trim().length === 0) {
      return res.redirect(`/admin/qa/${req.params.id}?error=Vui long nhap cau tra loi`);
    }

    const qa = await QA.findByIdAndUpdate(
      req.params.id,
      {
        status: "answered",
        answer,
        answeredBy: req.session.user.id,
        answeredAt: new Date(),
      },
      { new: true }
    );

    if (!qa) {
      return res.redirect("/admin/qa?error=Khong tim thay cau hoi");
    }

    res.redirect("/admin/qa?success=Tra loi cau hoi thanh cong");
  } catch (error) {
    console.error("[restaurant] Error in answerQuestion:", error);
    res.redirect(`/admin/qa/${req.params.id}?error=Co loi khi tra loi`);
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const qa = await QA.findByIdAndDelete(req.params.id);

    if (!qa) {
      return res.redirect("/admin/qa?error=Khong tim thay cau hoi");
    }

    res.redirect("/admin/qa?success=Xoa cau hoi thanh cong");
  } catch (error) {
    console.error("[restaurant] Error in deleteQuestion:", error);
    res.redirect("/admin/qa?error=Co loi khi xoa");
  }
};

// Ask question (customer)
exports.askQuestion = async (req, res) => {
  try {
    const { itemId, itemType, question } = req.body;
    const userId = req.session.user?.id;

    if (!itemId || !itemType || !question) {
      return res.status(400).json({ error: "Thong tin cau hoi khong du" });
    }

    if (question.trim().length < 5) {
      return res.status(400).json({ error: "Cau hoi phai co it nhat 5 ky tu" });
    }

    // Create question
    const qa = new QA({
      userId,
      itemId,
      itemType,
      question: question.trim(),
      status: "pending",
    });

    await qa.save();

    res.json({
      success: true,
      message: "Cau hoi cua ban se duoc tra loi trong 24 gio",
    });
  } catch (error) {
    console.error("[restaurant] Error in askQuestion:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get Q&A for an item (public)
exports.getItemQA = async (req, res) => {
  try {
    const { itemId, itemType } = req.params;

    const questions = await QA.find({
      itemId,
      itemType,
      status: "answered",
    })
      .populate("userId", "name")
      .populate("answeredBy", "name")
      .sort({ answeredAt: -1 });

    res.json({
      questions,
      totalQuestions: questions.length,
    });
  } catch (error) {
    console.error("[restaurant] Error in getItemQA:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
