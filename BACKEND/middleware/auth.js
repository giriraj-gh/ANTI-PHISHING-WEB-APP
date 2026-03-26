module.exports = (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
