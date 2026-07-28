// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect("/auth/login?error=Vui+lòng+đăng+nhập");
  }
  next();
}

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect("/auth/login?error=Vui+lòng+đăng+nhập");
  }
  if (req.session.user.role !== "admin") {
    return res.status(403).render("error", { 
      error: "Bạn không có quyền truy cập trang này",
      layout: false 
    });
  }
  next();
}

module.exports = {
  requireAuth,
  requireAdmin
};
