let express = require('express');
let router = express.Router();
const { checkToken, users } = require('../../models/user');
const { createChat, chats } = require('../../models/chat');
const { handleError, NotFoundError, AuthError } = require('./error-handler');

router.post('/', (req, res) => {
  try {
    const {token, userId} = req.body;

    if (checkToken({token, userId})) {
      const user = users.get(userId);
      user.updateLastActivity();
      const chat = createChat({...req.body.chat, ownerId: userId});
      chat.addPaticipant(user);
      res.json({
        chat
      });
    }

  } catch (error) {
    handleError(res, error);
  }
});

router.get('/', (req, res) => {
  try {
    res.json([...chats.values()].map(chat => chat.toJSON()));
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/:id', (req, res) => {
  try {
    const chatId = req.params.id;
    const chat = chats.get(chatId);
    if (!chat) {
      throw NotFoundError('Chat not found');
    }
    res.json({chat: chat.toJSON()});
  } catch (error) {
    handleError(res, error);
  }
});


module.exports = router;
