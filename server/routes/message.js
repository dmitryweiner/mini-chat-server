const express = require('express');
const router = express.Router();
const db = require('../../db').getDb();
const { checkToken, getUserByToken } = require('../../models/user');
const { createMessage } = require('../../models/message');
const { NotFoundError } = require('../error-handler');

router.post('/', (req, res) => {
  checkToken(req.cookies.token);

  const user = getUserByToken(req.cookies.token);

  const chat = db.get('chats').find({id: req.body.chatId}).value();
  if (!chat) {
    throw new NotFoundError('No chat found');
  }

  const message = createMessage({
    ...req.body,
    userId: user.id
  });
  res.json(message);
});

router.get('/', (req, res) => {
  checkToken(req.cookies.token);
  let messages = [];
  if (req.query.chatId) {
    messages = db.get('messages').filter({ chatId: req.query.chatId }).value();
  }
  // TODO: filter by date, sorting
  res.json(messages);
});

router.delete('/:id', (req, res) => {
  checkToken(req.cookies.token);
  // TODO: delete
  res.json({ message: 'not implemented yet'});
});

router.put('/:id', (req, res) => {
  checkToken(req.cookies.token);
  // TODO: edit message
  res.json({ message: 'not implemented yet'});
});

module.exports = router;
