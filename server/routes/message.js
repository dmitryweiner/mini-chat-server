const fs = require('fs');
const express = require('express');
const router = express.Router();
const db = require('../../db').getDb();
const User = require('../../models/user');
const Message = require('../../models/message');
const nanoid = require('nanoid');
const {
  NotAllowedError,
  NotFoundError,
  BadRequestError
} = require('../error-handler');
const {
  MESSAGE_TYPE_IMAGE,
  MESSAGE_TYPE_TEXT
} = require('../../models/message');
const config = require('../../config');
let clients = [];

router.post('/', (req, res) => {
  const message = createMessage(req, req.body.chatId, req.body);
  res.json(message);
});

router.get('/', (req, res) => {
  User.checkToken(req.cookies.token);
  let messages = [];
  if (req.query.chatId) {
    messages = Message.getByChatId(req.query.chatId);
  }
  // TODO: filter by date, sorting
  res.json(messages);
});

router.delete('/:id', (req, res) => {
  User.checkToken(req.cookies.token);
  const user = User.getByToken(req.cookies.token);
  const message = Message.getById(req.params.id);

  if (user.id !== message.userId) {
    throw new NotAllowedError('Only author can delete this message');
  }

  db.get('messages').remove({ id: message.id }).write();
  for (const client of clients) {
    if (client.chatId === message.chatId) {
      client.send(JSON.stringify({ deleted: message.id }));
    }
  }
  res.json({});
});

router.put('/:id', (req, res) => {
  User.checkToken(req.cookies.token);
  // TODO: edit message
  res.json({ message: 'not implemented yet' });
});

router.ws('/:id', (ws, req) => {
  User.checkToken(req.cookies.token);
  ws.id = nanoid.nanoid();
  ws.chatId = req.params.id;
  ws.on('message', msg => {
    console.log('ws message', msg);
    const message = JSON.parse(msg);
    try {
      createMessage(req, req.params.id, message);
    } catch (e) {
      ws.send(JSON.stringify({ error: e.message }));
    }
  });
  ws.on('close', () => {
    console.log('ws closing', ws.id);
    clients = clients.filter(client => client.id !== ws.id);
  });
  clients.push(ws);
});

/**
 * Creating new message
 *
 * @param {*} req
 * @param {string} chatId
 * @param {object} messageBody
 * @returns {Message}
 */
function createMessage(req, chatId, messageBody) {
  User.checkToken(req.cookies.token);

  const user = User.getByToken(req.cookies.token);

  const chat = db.get('chats').find({ id: chatId }).value();
  if (!chat) {
    throw new NotFoundError('No chat found');
  }

  if (!chat.participants.includes(user.id)) {
    throw new NotAllowedError('Current user is not a participant');
  }

  let fileData;
  switch (messageBody.type) {
    case MESSAGE_TYPE_IMAGE: {
      const matches = messageBody.content.match(
        /^data:([A-Za-z-+/]+);base64,(.+)$/
      );
      if (matches.length !== 3) {
        throw new BadRequestError(
          'Invalid content sent, should be like data:image/jpeg;base64,/9j/4AAQSkZJRgABAQE'
        );
      }
      messageBody.mimeType = matches[1];
      messageBody.content = '';
      fileData = matches[2];
      break;
    }
    case MESSAGE_TYPE_TEXT:
    default:
      messageBody.mimeType = 'text/html';
  }

  const message = Message.createMessage({
    ...messageBody,
    userId: user.id
  });

  if (message.type !== MESSAGE_TYPE_TEXT) {
    fs.writeFile(
      `${config.imagesDir}/${message.id}`,
      fileData,
      { encoding: 'base64' },
      function (err) {
        if (err) {
          throw new Error(`Error saving file: ${err.message}`);
        }
      }
    );
  }

  for (const client of clients) {
    if (client.chatId === chat.id) {
      client.send(JSON.stringify({ added: message }));
    }
  }

  return message;
}

module.exports = router;
