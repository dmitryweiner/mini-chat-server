/**
 * @module routes/auth
 */
const express = require('express');
const User = require('../../models/user');
const router = express.Router();

const TOKEN_COOKIE_NAME = 'token';

router.post('/', (req, res) => {
  const token = User.login({
    nickname: req.body.nickname,
    password: req.body.password
  });
  res.cookie(TOKEN_COOKIE_NAME, token, {
    maxAge: 24 * 60 * 60 * 1000, // TODO: to const
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ token });
});

router.get('/', (req, res) => {
  User.checkToken(req.cookies.token);
  res.json({ auth: true });
});

router.delete('/', (req, res) => {
  User.checkToken(req.cookies.token);
  User.logout(req.cookies.token);
  res.clearCookie(TOKEN_COOKIE_NAME);
  res.json({});
});

router.put('/', (req, res) => {
  res.json({ message: 'not implemented yet' });
});

module.exports = router;
