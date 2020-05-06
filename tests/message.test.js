const request = require('supertest');
const app = require('../server');
const { generateRandomUser, generateRandomChat } = require('./test-utils');

describe('Messasage', () => {
  let user;
  let chat;
  beforeEach(async () => {
    const res = await request(app)
      .post('/user/register')
      .send(generateRandomUser());
    user = res.body.user;

    const chatData = generateRandomChat();
    const res2 = await request(app)
      .post('/chat')
      .send({
        chat,
        userId: user.id,
        token: user.token
      });
    chat = res2.body.chat;
  });

  it('could be created', async () => {
    const message = {
      content: 'Test'
    };
    const res = await request(app)
      .post('/message')
      .send({
        message: {
          ...message,
          chatId: chat.id
        },
        userId: user.id,
        token: user.token
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatchObject({content: message.content, chatId: chat.id, authorId: user.id});
  });

  it('could not be created with wrong chatId', async () => {
    const message = {
      content: 'Test'
    };
    const res = await request(app)
      .post('/message')
      .send({
        message: {
          ...message,
          chatId: '1234'
        },
        userId: user.id,
        token: user.token
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

});
