const express = require('express');
const router = express.Router();
const db = require('../../db').getDb();
const User = require('../../models/user');
const Message = require('../../models/message');
const { NotAllowedError, NotFoundError } = require('../error-handler');

router.post('/', (req, res) => {
  User.checkToken(req.cookies.token);

  const user = User.getByToken(req.cookies.token);

  const chat = db.get('chats').find({id: req.body.chatId}).value();
  if (!chat) {
    throw new NotFoundError('No chat found');
  }

  if (!chat.participants.includes(user.id)) {
    throw new NotAllowedError('Current user is not a participant');
  }

  const message = Message.createMessage({
    ...req.body,
    userId: user.id
  });
  res.json(message);
});

router.get('/', (req, res) => {
  User.checkToken(req.cookies.token);
  let messages = [];
  if (req.query.chatId) {
    messages = db.get('messages').filter({ chatId: req.query.chatId }).value();
  }
  // TODO: filter by date, sorting
  res.json(messages);
});

router.delete('/:id', (req, res) => {
  User.checkToken(req.cookies.token);
  // TODO: delete
  res.json({ message: 'not implemented yet'});
});

router.put('/:id', (req, res) => {
  User.checkToken(req.cookies.token);
  // TODO: edit message
  res.json({ message: 'not implemented yet'});
});

module.exports = router;
