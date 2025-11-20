const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/verify-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.json({ valid: false });
  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) return res.json({ valid: false });
    res.json({ valid: true });
  });
});

module.exports = router;