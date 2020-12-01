const express = require('express');
const db = require('../../db').getDb();
const User = require('../../models/user');
const router = express.Router();

const RESTRICTED_FIELDS = ['password'];

router.post('/', (req, res) => {
  const user = User.createUser({
    nickname: req.body.nickname,
    password: req.body.password
  });
  res.json(user.getWithoutSomeFields(RESTRICTED_FIELDS));
});

router.get('/', (req, res) => {
  User.checkToken(req.cookies.token);
  const currentUser = User.getByToken(req.cookies.token);
  // search user by nickname
  if (req.query.nickname) {
    const users = db
      .get('users')
      .filter(
        user =>
          currentUser.id !== user.id &&
          user.nickname
            .toUpperCase()
            .indexOf(req.query.nickname.toUpperCase()) >= 0
      )
      .value();
    return res.json(
      users.map(user =>
        new User().hydrate(user).getWithoutSomeFields(RESTRICTED_FIELDS)
      )
    );
  }

  // get currently logged user
  const user = User.getByToken(req.cookies.token);
  return res.json(user.getWithoutSomeFields(RESTRICTED_FIELDS));
});

router.get('/:id', (req, res) => {
  User.checkToken(req.cookies.token);
  res.json(User.getById(req.params.id).getWithoutSomeFields(RESTRICTED_FIELDS));
});

router.put('/', (req, res) => {
  User.checkToken(req.cookies.token);
  const user = User.getByToken(req.cookies.token);
  user.edit(req.body);
  db.get('users').find({ id: user.id }).assign(user).write();
  return res.json(user.getWithoutSomeFields(RESTRICTED_FIELDS));
});

router.delete('/', (req, res) => {
  // TODO: delete user
  res.json({ message: 'not implemented yet' });
});

module.exports = router;
