const express = require('express');
const router = express.Router();
const { createUser } = require('../../models/user');
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

// TODO: delete, update

module.exports = router;
