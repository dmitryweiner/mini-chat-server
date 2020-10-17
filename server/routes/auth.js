const express = require('express');
const router = express.Router();
const db = require('../../db').getDb();
const { handleError } = require('../error-handler');

router.post('/', (req, res) => {
  try {
    console.log(req.body);
    console.log(typeof db);
    const user = { nickname: req.body.nickname, password: req.body.password };
    db.get('users').push(user).write();
    console.log(db.getState());
    res.json({
      user
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
