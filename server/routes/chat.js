const express = require('express');
const router = express.Router();
const db = require('../../db').getDb();
const { checkToken, users } = require('../../models/user');
const { createChat, chats } = require('../../models/chat');
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

router.post('/my', (req, res) => {
  try {
    const {token, userId} = req.body;

    if (checkToken({token, userId})) {
      const user = users.get(userId);
      user.updateLastActivity();
      const filteredChats = [...chats.values()].filter((chat) =>
        chat.ownerId === user.id || chat.participants.has(user.id)
      );
      res.json(filteredChats.map(chat => chat.toJSON()));
    }
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/search', (req, res) => {
  try {
    const {token, userId, query} = req.body;

    if (checkToken({token, userId})) {
      const regExp = new RegExp(query, 'i');
      const filteredChats = [...chats.values()].filter((chat) =>
        regExp.test(chat.title)
      );
      res.json(filteredChats.map(chat => chat.toJSON()));
    }
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
    const {token, userId} = req.body;

    if (checkToken({token, userId})) {
      const chatId = req.params.id;
      const user = users.get(userId);
      user.updateLastActivity();
      const chat = chats.get(chatId);
      if (!chat) {
        throw NotFoundError('Chat not found');
      }

      // TODO: here should be check for privacy

      chat.addParticipant(user);
      res.json(chat);
    }
  } catch (error) {
    handleError(res, error);
  }
});


module.exports = router;
