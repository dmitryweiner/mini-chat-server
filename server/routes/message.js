let express = require('express');
let router = express.Router();
const { checkToken, users } = require('../../models/user');
const { createMessage } = require('../../models/message');
const { chats } = require('../../models/chat');
const { handleError, NotFoundError, AuthError } = require('../error-handler');


router.post('/', (req, res) => {
  try {
    const {token, userId} = req.body;

    checkToken({token, userId});

    const user = users.get(userId);
    user.updateLastActivity();

    const chat = chats.get(req.body.message.chatId);
    if (!chat) {
      throw new NotFoundError('No chat found');
    }

    const message = createMessage({
      ...req.body.message,
      authorId: userId
    });

    chat.addMessage(message);

    res.json({
      message
    });

  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
