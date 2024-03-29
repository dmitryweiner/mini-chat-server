const express = require('express');
const router = express.Router();
const db = require('../../db').getDb();
const User = require('../../models/user');
const Chat = require('../../models/chat');
const {
  BadRequestError,
  NotFoundError,
  NotAllowedError
} = require('../error-handler');

router.post('/', (req, res) => {
  User.checkToken(req.cookies.token);
  const user = User.getByToken(req.cookies.token);
  let chat;
  if (req.body.isDialogue) {
    const foundDialogue = Chat.getDialogueByParticipantIds([
      user.id,
      req.body.participants[0]
    ]);
    if (foundDialogue) {
      chat = foundDialogue;
      res.status(303);
    } else {
      chat = Chat.createDialogue({
        participants: [user.id, req.body.participants[0]]
      });
    }
  } else {
    let participants = [user.id];
    if (
      req.body.participants !== undefined &&
      Array.isArray(req.body.participants)
    ) {
      participants = [...participants, ...req.body.participants];
      participants = [...new Set(participants)];
    }
    chat = Chat.createChat({
      title: req.body.title,
      isPrivate: req.body.isPrivate,
      participants,
      userId: user.id
    });
  }
  res.json(chat);
});

router.get('/', (req, res) => {
  User.checkToken(req.cookies.token);
  let chats = [];
  if (req.query.userId) {
    chats = db.get('chats').filter({ userId: req.query.userId }).value();
  } else if (req.query.participantId) {
    chats = Chat.getByParticipantId(req.query.participantId);
  } else if (req.query.title) {
    chats = db
      .get('chats')
      .filter(chat => {
        return (
          !chat.isDialogue &&
          !chat.isPrivate &&
          chat.title.toUpperCase().indexOf(req.query.title.toUpperCase()) >= 0
        );
      })
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

  const user = User.getByToken(req.cookies.token);

  const chat = Chat.getById(req.params.id);
  if (!chat) {
    throw new NotFoundError('Chat not found');
  }

  if (chat.isDialogue) {
    throw new BadRequestError('Could not update dialogue');
  }

  if (user.id === chat.userId) {
    // is chat owner: edit chat
    chat.edit(req.body);
  } else {
    // is not chat owner: join chat
    chat.addParticipant(user.id);
  }
  db.get('chats').find({ id: chat.id }).assign(chat).write();
  res.json(chat);
});

router.delete('/:id', (req, res) => {
  User.checkToken(req.cookies.token);
  const user = User.getByToken(req.cookies.token);

  const chat = Chat.getById(req.params.id);
  if (!chat) {
    throw new NotFoundError('Chat not found');
  }

  const isOwner = user.id === chat.userId;
  const isParticipant = chat.isParticipant(user.id);

  if (
    (!chat.isDialogue && !isOwner && !isParticipant) ||
    (chat.isDialogue && !isParticipant)
  ) {
    throw new NotAllowedError(
      'User should be owner of deleting chat or participant of deleting dialogue'
    );
  }

  if ((chat.isDialogue && isParticipant) || (!chat.isDialogue && isOwner)) {
    db.get('chats').remove({ id: chat.id }).write();
    db.get('messages').remove({ chatId: chat.id }).write();
  } else {
    chat.participants = chat.participants.filter(userId => userId !== user.id);
    db.get('chats').find({ id: chat.id }).assign(chat).write();
  }
  res.json({});
});

module.exports = router;
