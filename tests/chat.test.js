const request = require('supertest');
const app = require('../server');
const { generateRandomUser, generateRandomChat } = require('./test-utils');

describe('Chat', () => {
  let user;
  beforeEach(async () => {
    const res = await request(app)
      .post('/user/register')
      .send(generateRandomUser());
    user = res.body.user;
  });

  it('could be created', async () => {
    const chat = generateRandomChat();
    const res = await request(app)
      .post('/chat')
      .send({
        chat,
        userId: user.id,
        token: user.token
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('chat');
  });

  it('is visible', async () => {
    const chat = generateRandomChat();
    const res = await request(app)
      .post('/chat')
      .send({
        chat,
        userId: user.id,
        token: user.token
      });

    const res2 = await request(app)
      .get(`/chat/${res.body.chat.id}`);

    expect(res2.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('chat');
    expect(res.body.chat.title).toEqual(chat.title);
    expect(res.body.chat.ownerId).toEqual(user.id);
  });

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

});
