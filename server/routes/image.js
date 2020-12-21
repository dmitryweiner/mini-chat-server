const express = require('express');
const config = require('../../config');
const Message = require('../../models/message');
const User = require('../../models/user');
const { NotFoundError } = require('../error-handler');
const router = express.Router();

router.get('/:id', (req, res) => {
  User.checkToken(req.cookies.token);
  const messageId = req.params.id;
  const message = Message.getById(messageId);
  if (!message) {
    throw new NotFoundError('Message with this ID not found');
  }
  res.type(message.mimeType).sendFile(`${config.imagesDir}/${message.id}`);
});

module.exports = router;
