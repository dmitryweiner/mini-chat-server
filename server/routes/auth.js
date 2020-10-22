const express = require('express');
const { logout } = require('../../models/user');
const { checkToken, login } = require('../../models/user');
const router = express.Router();

const TOKEN_COOKIE_NAME = 'token';

router.post('/', (req, res) => {
  const token = login({ nickname: req.body.nickname, password: req.body.password });
  res.cookie(TOKEN_COOKIE_NAME, token, {
    maxAge: 24 * 60 * 60, // TODO: to const
    httpOnly: true
    // should uncomment when HTTPS is set
    // secure: process.env.NODE_ENV === 'production'
  });
  res.json({token});
});

router.get('/', (req, res) => {
  checkToken(req.cookies.token);
  res.json({auth: true});
});

router.delete('/', (req, res) => {
  checkToken(req.cookies.token);
  logout(req.cookies.token);
  res.clearCookie(TOKEN_COOKIE_NAME);
  res.json({});
});

router.put('/', (req, res) => {
  res.json({ message: 'not implemented yet'});
});

module.exports = router;
