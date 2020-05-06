let express = require('express');
let router = express.Router();
const { createUser, login } = require('../../models/user');

router.post('/register', (req, res) => {
  try {
    const user = createUser({ nickname: req.body.nickname, password: req.body.password });
    res.json({
      user
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

router.post('/login', (req, res) => {
  try {
    const user = login({ nickname: req.body.nickname, password: req.body.password });
    res.json({
      user
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

module.exports = router;
