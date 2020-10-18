const request = require('supertest');
const app = require('../server');
const { cleanTestDb } = require('../db');
const { generateRandomUser, generateRandomChat } = require('./test-utils');

let authCookie;
let authUser;
beforeAll(async () => {
  const user = generateRandomUser();
  const res = await request(app)
    .post('/user')
    .send(user);
  authUser = res.body;
  const res2 = await request(app)
    .post('/auth')
    .send(user);
  authCookie = res2.headers['set-cookie'][0];
});

afterAll(() => {
  cleanTestDb();
});

describe('Chat', () => {
  it('should create chat with title', async () => {
    const chat = generateRandomChat();
    chat.userId = authUser.id;
    const res = await request(app)
      .post('/chat')
      .set('Cookie', [authCookie])
      .send(chat);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title');
    expect(res.body.title).toEqual(chat.title);
  });

  it('should not create chat with empty title', async () => {
    const chat = generateRandomChat();
    chat.userId = authUser.id;
    chat.title = '';
    const res = await request(app)
      .post('/chat')
      .set('Cookie', [authCookie])
      .send(chat);
    expect(res.statusCode).toEqual(400);
  });

  it('should be accessible by id', async () => {
    const chat = generateRandomChat();
    chat.userId = authUser.id;
    const res = await request(app)
      .post('/chat')
      .set('Cookie', [authCookie])
      .send(chat);

    const res2 = await request(app)
      .get(`/chat/${res.body.id}`)
      .set('Cookie', [authCookie]);

    expect(res2.statusCode).toEqual(200);
    expect(res2.body).toHaveProperty('title');
    expect(res2.body.title).toEqual(chat.title);
    expect(res2.body.userId).toEqual(authUser.id);
  });

  /*
  it('is visible in list', async () => {
    const chat = generateRandomChat();
    const res = await request(app)
      .post('/chat')
      .send({
        chat,
        userId: user.id,
        token: user.token
      });

    const res2 = await request(app)
      .get(`/chat`);

    expect(res2.statusCode).toEqual(200);
    expect(res2.body).toContainObject({title: chat.title});
  });
 */
});
