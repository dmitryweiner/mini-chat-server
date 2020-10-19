const express = require('express');
const { logout } = require('../../models/user');
const { checkToken, login } = require('../../models/user');
const router = express.Router();
const { handleError } = require('../error-handler');

const TOKEN_COOKIE_NAME = 'token';

router.post('/', (req, res) => {
  try {
    const token = login({ nickname: req.body.nickname, password: req.body.password });
    res.cookie(TOKEN_COOKIE_NAME, token, {
      maxAge: 24 * 60 * 60, // TODO: to const
      httpOnly: true
      // should uncomment when HTTPS is set
      // secure: process.env.NODE_ENV === 'production'
    });
    res.json({token});
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/', (req, res) => {
  try {
    checkToken(req.cookies.token);
    res.json({});
  } catch (error) {
    handleError(res, error);
  }
});

router.delete('/', (req, res) => {
  try {
    checkToken(req.cookies.token);
    logout(req.cookies.token);
    res.clearCookie(TOKEN_COOKIE_NAME);
    res.json({});
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
