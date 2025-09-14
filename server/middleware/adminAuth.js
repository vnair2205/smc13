// smc12/server/middleware/adminAuth.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin'); // It's good practice to ensure the admin still exists

module.exports = async function(req, res, next) {
  // 1. Get token from header
  const token = req.header('x-auth-token');

  // 2. Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Verify token
  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    // --- FIX: Change decoded.user to decoded.admin ---
    // The JWT payload for admins uses the 'admin' key, not 'user'.
    req.user = decoded.admin;

    // 4. Optional but recommended: Check if the admin user still exists in the DB
    const adminExists = await Admin.findById(req.user.id);
    if (!adminExists) {
        return res.status(401).json({ msg: 'Admin user not found, authorization denied.' });
    }

    next();
  } catch (err) {
    console.error('Error in adminAuth middleware:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};