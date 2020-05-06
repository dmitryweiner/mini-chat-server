let express = require('express');
let router = express.Router();
const { checkToken } = require('../../models/user');
const { createChat, chats } = require('../../models/chat');

router.post('/', (req, res) => {
  try {
    const {token, userId} = req.body;

    if (checkToken({token, userId})) {
      const chat = createChat({...req.body.chat, ownerId: userId});
      res.json({
        chat
      });
    }

  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

router.get('/', (req, res) => {
  try {
    res.json([...chats.values()]);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const chatId = req.params.id;
    const chat = chats.get(chatId);
    if (!chat) {
      throw Error('Chat not found');
    }
    res.json({chat});
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});


module.exports = router;
