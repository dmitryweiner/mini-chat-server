const request = require('supertest');
const app = require('../server');
const { cleanTestDb } = require('../db');
const { generateRandomUser, generateRandomChat } = require('./test-utils');

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
    expect(res.body.content).toEqual(message.content);
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
});
