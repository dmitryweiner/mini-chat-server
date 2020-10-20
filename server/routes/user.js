const express = require('express');
const db = require('../../db').getDb();
const { getUserById, getUserByToken, checkToken, createUser } = require('../../models/user');
const router = express.Router();
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
    checkToken(req.cookies.token);

    // search user by nickname
    if (req.query.nickname) {
      const users = db.get('users')
        .filter(user => user.nickname.toUpperCase().indexOf(req.query.nickname.toUpperCase()) >= 0)
        .value();
      return res.json(users);
    }

    // get currently logged user
    const user = getUserByToken(req.cookies.token);
    return res.json(user);
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/:id', (req, res) => {
  try {
    checkToken(req.cookies.token);
    res.json(getUserById(req.params.id));
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
