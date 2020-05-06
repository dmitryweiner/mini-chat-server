let express = require('express');
let router = express.Router();
const { checkToken } = require('../../models/user');
const { createMessage } = require('../../models/message');
const { chats } = require('../../models/chat');

router.post('/', (req, res) => {
  try {
    const {token, userId} = req.body;

    checkToken({token, userId});

    if (!chats.has(req.body.message.chatId)) {
      throw new Error('No chat found');
    }

    const message = createMessage({
      ...req.body.message,
      authorId: userId
    });

    res.json({
      message
    });

  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

module.exports = router;
