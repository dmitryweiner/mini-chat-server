const express = require('express');
const db = require('../../db').getDb();
const { getUserById, getUserByToken, checkToken, createUser } = require('../../models/user');
const router = express.Router();

const RESTRICTED_FIELDS = ['password'];

router.post('/', (req, res) => {
  const user = createUser({ nickname: req.body.nickname, password: req.body.password });
  res.json(
    user.getWithoutSomeFields(RESTRICTED_FIELDS)
  );
});

router.get('/', (req, res) => {
  checkToken(req.cookies.token);
  // search user by nickname
  if (req.query.nickname) {
    const users = db.get('users')
      .filter(user => user.nickname.toUpperCase().indexOf(req.query.nickname.toUpperCase()) >= 0)
      .value();
    return res.json(users.map(user => user.getWithoutSomeFields(RESTRICTED_FIELDS)));
  }

  // get currently logged user
  const user = getUserByToken(req.cookies.token);
  return res.json(user.getWithoutSomeFields(RESTRICTED_FIELDS));
});

router.get('/:id', (req, res) => {
  checkToken(req.cookies.token);
  res.json(getUserById(req.params.id).getWithoutSomeFields(RESTRICTED_FIELDS));
});

router.put('/', (req, res) => {
  // TODO: edit user profile
  res.json({ message: 'not implemented yet'});
});

router.delete('/', (req, res) => {
  // TODO: delete user
  res.json({ message: 'not implemented yet'});
});

module.exports = router;
