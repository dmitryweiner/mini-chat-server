let express = require('express');
let router = express.Router();
const { createUser, login } = require('../../models/user');
const { handleError, NotFoundError, AuthError } = require('./error-handler');


router.post('/register', (req, res) => {
  try {
    const user = createUser({ nickname: req.body.nickname, password: req.body.password });
    res.json({
      user
    });
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/login', (req, res) => {
  try {
    const user = login({ nickname: req.body.nickname, password: req.body.password });
    res.json({
      user
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
