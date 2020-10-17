const express = require('express');
const { login } = require('../../models/user');
const router = express.Router();
const db = require('../../db').getDb();
const { handleError } = require('../error-handler');

router.post('/', (req, res) => {
  try {
    const token = login({ nickname: req.body.nickname, password: req.body.password });
    res.cookie('token', token, {
      maxAge: 24 * 60 * 60,
      httpOnly: true
      // secure: process.env.NODE_ENV === 'production'
    });
    res.json(token);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
