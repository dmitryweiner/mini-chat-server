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

router.get('/', (req, res) => {
  try {
    // TODO: search by user nickname
    res.json({ });
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/:id', (req, res) => {
  try {
    // TODO: get user profile
    res.json({ });
  } catch (error) {
    handleError(res, error);
  }
});

router.put('/', (req, res) => {
  try {
    // TODO: edit user profile
    res.json({ });
  } catch (error) {
    handleError(res, error);
  }
});

router.delete('/', (req, res) => {
  try {
    // TODO: delete user
    res.json({ });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
