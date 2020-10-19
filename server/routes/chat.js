const express = require('express');
const router = express.Router();
const db = require('../../db').getDb();
const { checkToken } = require('../../models/user');
const { createChat } = require('../../models/chat');
const { handleError, NotFoundError } = require('../error-handler');

router.post('/', (req, res) => {
  try {
    checkToken(req.cookies.token);

    // check if user exists
    const user = db.get('users').find({id: req.body.userId}).value();
    if (!user) {
      throw new NotFoundError('No user found');
    }

    const chatObject = createChat(req.body);
    res.json(
      chatObject
    );
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/', (req, res) => {
  try {
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
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/:id', (req, res) => {
  try {
    checkToken(req.cookies.token);
    const chatId = req.params.id;
    const chat = db.get('chats').find({id: chatId}).value();
    if (!chat) {
      throw new NotFoundError('Chat not found');
    }
    res.json(chat);
  } catch (error) {
    handleError(res, error);
  }
});

router.put('/:id', (req, res) => {
  try {
    // TODO: join chat
    res.json({ });
  } catch (error) {
    handleError(res, error);
  }
});

router.delete('/:id', (req, res) => {
  try {
    // TODO: delete chat
    res.json({ });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
