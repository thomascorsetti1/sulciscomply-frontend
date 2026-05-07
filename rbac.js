const rolePermissions = {
  Admin: ["create", "read", "update", "delete", "manage_users"],
  Professional: ["create", "read", "update", "manage_own"],
  Staff: ["read", "update", "manage_own"],
  Viewer: ["read"],
};

const rbacMiddleware = (requiredPermissions) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({ error: "No role assigned" });
    }

    const userPermissions = rolePermissions[userRole] || [];
    const hasPermission = requiredPermissions.some((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      return res
        .status(403)
        .json({ error: `Insufficient permissions. Required: ${requiredPermissions.join(", ")}` });
    }

    next();
  };
};

module.exports = rbacMiddleware;
