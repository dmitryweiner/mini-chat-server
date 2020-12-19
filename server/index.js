const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { initDb } = require('../db');

const app = express();
require('express-ws')(app);

if (process.env.NODE_ENV === 'test') {
  // test mode
  initDb(true);
} else {
  // server mode
  app.use(morgan('combined'));
}

const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const chatRoute = require('./routes/chat');
const messageRoute = require('./routes/message');

app.use(
  cors({
    credentials: true,
    origin: true
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/auth', authRoute);
app.use('/user', userRoute);
app.use('/chat', chatRoute);
app.use('/message', messageRoute);
app.use(express.Router().get('/', (req, res) => res.json({ ok: true })));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = err;

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err.message });
});

module.exports = app;
