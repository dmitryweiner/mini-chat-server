const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const { createUser, login } = require('../models/user');
const users = new Map();
const chatRooms = new Map();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/register', (req, res) => {
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

app.post('/login', (req, res) => {
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

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err });
});

module.exports = app;
