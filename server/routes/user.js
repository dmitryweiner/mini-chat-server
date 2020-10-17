const express = require('express');
const router = express.Router();
const { createUser, login } = require('../../models/user');
const { handleError } = require('../error-handler');

router.post('/', (req, res) => {
  try {
    const user = createUser({ nickname: req.body.nickname, password: req.body.password });
    res.json(
      user
    );
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/login', (req, res) => {
  try {
    const user = login({ nickname: req.body.nickname, password: req.body.password });
    res.json(user);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
