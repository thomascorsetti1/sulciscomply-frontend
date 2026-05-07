const tenantIsolationMiddleware = (req, res, next) => {
  const studioId = req.user?.studio_id;
  const userRole = req.user?.role;

  if (!studioId) {
    return res.status(403).json({ error: "No studio assigned" });
  }

  // Attach studio_id to request for use in route handlers
  req.studioId = studioId;
  req.userRole = userRole;

  next();
};

module.exports = tenantIsolationMiddleware;
