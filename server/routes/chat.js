const express = require('express');
const router = express.Router();
const db = require('../../db').getDb();
const User = require('../../models/user');
const Chat = require('../../models/chat');
const { NotFoundError, NotAllowedError } = require('../error-handler');

router.post('/', (req, res) => {
  User.checkToken(req.cookies.token);
  const user = User.getByToken(req.cookies.token);
  const chatObject = Chat.createChat({
    ...req.body,
    userId: user.id
  });
  res.json(
    chatObject
  );
});

router.get('/', (req, res) => {
  User.checkToken(req.cookies.token);
  let chats = [];
  if (req.query.userId) {
    chats = db.get('chats').filter({userId: req.query.userId}).value();
  } else if (req.query.participantId) {
    chats = db.get('chats').filter(chat => chat.participants.includes(req.query.participantId)).value();
  } else if (req.query.title) {
    chats = db.get('chats')
      .filter(chat => chat.title.toUpperCase().indexOf(req.query.title.toUpperCase()) >= 0)
      .value();
  }
  if (!chats) {
    throw new NotFoundError('Chats not found');
  }
  res.json(chats);
});

router.get('/:id', (req, res) => {
  User.checkToken(req.cookies.token);
  res.json(Chat.getById(req.params.id));
});

router.put('/:id', (req, res) => {
  User.checkToken(req.cookies.token);
  if (!Array.isArray(req.body.participants) ||
    req.body.participants.length === 0) {
    throw Error('Participants should be non-empty array');
  }

  const chat = Chat.getById(req.params.id);
  if (!chat) {
    throw new NotFoundError('Chat not found');
  }

  chat.addParticipant(req.body.participants[0]);
  db.get('chats').find({id: chat.id}).push(chat).write();
  res.json(chat);
});

router.delete('/:id', (req, res) => {
  User.checkToken(req.cookies.token);
  const chat = Chat.getById(req.params.id);
  if (!chat) {
    throw new NotFoundError('Chat not found');
  }
  const user = User.getByToken(req.cookies.token);
  if (user.id !== chat.userId) {
    throw new NotAllowedError('User should be owner of deleting chat');
  }

  db.get('chats').remove({id: chat.id}).write();
  db.get('messages').remove({chatId: chat.id}).write();
  res.json({});
});

module.exports = router;
