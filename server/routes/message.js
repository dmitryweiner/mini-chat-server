const express = require('express');
const router = express.Router();
const db = require('../../db').getDb();
const User = require('../../models/user');
const Message = require('../../models/message');
const nanoid = require('nanoid');
const { NotAllowedError, NotFoundError } = require('../error-handler');
let clients = [];

router.post('/', (req, res) => {
  const message = createMessage(req, req.body.chatId, req.body);
  res.json(message);
});

router.get('/', (req, res) => {
  User.checkToken(req.cookies.token);
  let messages = [];
  if (req.query.chatId) {
    messages = db.get('messages').filter({ chatId: req.query.chatId }).value();
  }
  // TODO: filter by date, sorting
  res.json(messages);
});

router.delete('/:id', (req, res) => {
  User.checkToken(req.cookies.token);
  // TODO: delete
  res.json({ message: 'not implemented yet' });
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

  const message = Message.createMessage({
    ...messageBody,
    userId: user.id
  });

  for (const client of clients) {
    if (client.chatId === chat.id) {
      console.log('ws send', message);
      client.send(JSON.stringify(message));
    }
  }

  return message;
}

module.exports = router;
