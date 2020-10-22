const express = require('express');
const router = express.Router();
const db = require('../../db').getDb();
const { checkToken, getUserByToken } = require('../../models/user');
const { createChat, getChatById } = require('../../models/chat');
const { NotFoundError, NotAllowedError } = require('../error-handler');

router.post('/', (req, res) => {
  checkToken(req.cookies.token);
  const user = getUserByToken(req.cookies.token);
  const chatObject = createChat({
    ...req.body,
    userId: user.id
  });
  res.json(
    chatObject
  );
});

router.get('/', (req, res) => {
  checkToken(req.cookies.token);
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
  checkToken(req.cookies.token);
  res.json(getChatById(req.params.id));
});

router.put('/:id', (req, res) => {
  checkToken(req.cookies.token);
  if (!Array.isArray(req.body.participants) ||
    req.body.participants.length === 0) {
    throw Error('Participants should be non-empty array');
  }

  const chat = getChatById(req.params.id);
  if (!chat) {
    throw new NotFoundError('Chat not found');
  }

  chat.addParticipant(req.body.participants[0]);
  db.get('chats').find({id: chat.id}).push(chat).write();
  res.json(chat);
});

router.delete('/:id', (req, res) => {
  checkToken(req.cookies.token);
  const chat = getChatById(req.params.id);
  if (!chat) {
    throw new NotFoundError('Chat not found');
  }
  const user = getUserByToken(req.cookies.token);
  if (user.id !== chat.userId) {
    throw new NotAllowedError('User should be owner of deleting chat');
  }

  db.get('chats').remove({id: chat.id}).write();
  // TODO: delete messages
  res.json({});
});

module.exports = router;
