const roleGuard = (role) => (req, res, next) => {
  if (req.user && req.user.role === role) {
    next();
  } else {
    res.status(403).json({ message: `Access denied: Requires ${role} role` });
  }
};

// Also export specific guards for convenience if needed by other routes
roleGuard.adminGuard = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Requires Admin role' });
  }
};

roleGuard.studentGuard = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Requires Student role' });
  }
};

module.exports = roleGuard;
