const express = require('express');
const { convertUnit } = require('../services/donViService');

const router = express.Router();

router.post('/convert', (req, res) => {
  try {
    return res.json(convertUnit(req.body));
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Loi doi don vi tinh' });
  }
});

module.exports = router;
