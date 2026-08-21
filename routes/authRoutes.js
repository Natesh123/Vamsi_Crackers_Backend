const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin123';

  if (username === adminUser && password === adminPass) {
    res.json({ success: true, token: "dummy_token" });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

module.exports = router;
