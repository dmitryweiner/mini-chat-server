const fs = require('fs');
const request = require('supertest');
const app = require('../server');
const { MESSAGE_TYPE_IMAGE, MESSAGE_TYPE_TEXT } = require('../models/message');
const { cleanTestDb } = require('../db');
const { generateRandomUser, generateRandomChat } = require('./test-utils');
const config = require('../config');

let authCookie;
let authUser;
let createdChat;
beforeAll(async () => {
  const user = generateRandomUser();
  const res = await request(app).post('/user').send(user);
  authUser = res.body;
  const res2 = await request(app).post('/auth').send(user);
  authCookie = res2.headers['set-cookie'][0];

  const chat = generateRandomChat();
  chat.userId = authUser.id;
  const res3 = await request(app)
    .post('/chat')
    .set('Cookie', [authCookie])
    .send(chat);
  createdChat = res3.body;
});

afterAll(() => {
  cleanTestDb();
});

describe('Messasage', () => {
  it('should be created', async () => {
    const message = {
      content: 'Test',
      chatId: createdChat.id
    };
    const res = await request(app)
      .post('/message')
      .set('Cookie', [authCookie])
      .send(message);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('content');
    expect(res.body).toHaveProperty('type');
    expect(res.body.content).toEqual(message.content);
    expect(res.body.type).toEqual(MESSAGE_TYPE_TEXT);
    expect(res.body.userId).toEqual(authUser.id);
  });

  it('should not be created with wrong chatId', async () => {
    const message = {
      content: 'Test',
      chatId: '123'
    };
    const res = await request(app)
      .post('/message')
      .set('Cookie', [authCookie])
      .send(message);
    expect(res.statusCode).toEqual(404);
  });

  it('should not be created with wrong content', async () => {
    const message = {
      content: '',
      chatId: createdChat.id
    };

    let res = await request(app)
      .post('/message')
      .set('Cookie', [authCookie])
      .send(message);
    expect(res.statusCode).toEqual(400);

    message.content = { a: 1 };
    res = await request(app)
      .post('/message')
      .set('Cookie', [authCookie])
      .send(message);
    expect(res.statusCode).toEqual(400);

    message.content = false;
    res = await request(app)
      .post('/message')
      .set('Cookie', [authCookie])
      .send(message);
    expect(res.statusCode).toEqual(400);
  });

  it('visible in chat', async () => {
    const res = await request(app)
      .get(`/message/?chatId=${createdChat.id}`)
      .set('Cookie', [authCookie]);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0]).toHaveProperty('content');
  });

  it('not participant cannot send message', async () => {
    const message = {
      content: 'Test',
      chatId: createdChat.id
    };

    const notParticipantUser = generateRandomUser();
    await request(app).post('/user').send(notParticipantUser);
    let res = await request(app).post('/auth').send(notParticipantUser);
    const notParticipantAuthCookie = res.headers['set-cookie'][0];

    res = await request(app)
      .post('/message')
      .set('Cookie', [notParticipantAuthCookie])
      .send(message);
    expect(res.statusCode).toEqual(403);
  });

  it('could create message with image', async () => {
    const message = {
      type: MESSAGE_TYPE_IMAGE,
      content:
        'data:image/jpeg;base64,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',
      chatId: createdChat.id
    };

    let res = await request(app)
      .post('/message')
      .set('Cookie', [authCookie])
      .send(message);
    const createdMessage = res.body;
    expect(res.statusCode).toEqual(200);
    expect(res.body.type).toEqual('image');
    expect(res.body).toHaveProperty('mimeType');
    expect(res.body.mimeType).toEqual('image/jpeg');
    expect(res.body).toHaveProperty('url');
    expect(res.body.url).not.toBeFalsy();

    const url = res.body.url;
    res = await request(app).get(url).set('Cookie', [authCookie]);
    expect(res.statusCode).toEqual(200);
    await fs.unlink(`${config.imagesDir}/${createdMessage.id}`, err => {
      if (err) {
        console.error(err);
      }
    });
  });
});
