const request = require('supertest');
const app = require('../server');
const { getDb, cleanTestDb } = require('../db');
const { generateRandomUser } = require('./test-utils');

let user, authCookie, anotherUser, anotherAuthCookie, chat, createdChat, message;

beforeAll(async () => {
  const createdUser = generateRandomUser();
  let res = await request(app)
    .post('/user')
    .send(createdUser);
  user = res.body;
  res = await request(app)
    .post('/auth')
    .send(createdUser);
  authCookie = res.headers['set-cookie'][0];

  const createdAnotherUser = generateRandomUser();
  res = await request(app)
    .post('/user')
    .send(createdAnotherUser);
  anotherUser = res.body;
  res = await request(app)
    .post('/auth')
    .send(createdAnotherUser);
  anotherAuthCookie = res.headers['set-cookie'][0];

  chat = {
    participants: [anotherUser.id],
    isDialogue: true
  };
  res = await request(app)
    .post('/chat')
    .set('Cookie', [authCookie])
    .send(chat);
  createdChat = res.body;

  message = {
    chatId: createdChat.id,
    content: 'test'
  };
});

afterAll(() => {
  cleanTestDb();
});

it('user can create dialogue', async () => {
  const chat = {
    participants: [anotherUser.id],
    title: 'dialogue',
    isDialogue: true
  };
  const res = await request(app)
    .post('/chat')
    .set('Cookie', [authCookie])
    .send(chat);
  expect(res.statusCode).toEqual(200);
  expect(res.body).toHaveProperty('isDialogue');
  expect(res.body.userId).toBeFalsy();
  expect(res.body.isDialogue).toBeTruthy();
  expect(res.body.participants).toEqual([user.id, anotherUser.id]);
});

it('user can delete dialogue', async () => {
  let res = await request(app)
    .post('/chat')
    .set('Cookie', [authCookie])
    .send(chat);

  const createdChat = res.body;
  res = await request(app)
    .delete(`/chat/${createdChat.id}`)
    .set('Cookie', [authCookie])
    .send(chat);
  expect(res.statusCode).toEqual(200);
  expect(getDb().get('chats').find({id: createdChat.id}).value()).toBeFalsy();
});

it('user can post message to a dialogue', async () => {
  let res = await request(app)
    .post('/message')
    .set('Cookie', [authCookie])
    .send(message);
  expect(res.statusCode).toEqual(200);

  res = await request(app)
    .get(`/message/?chatId=${createdChat.id}`)
    .set('Cookie', [authCookie])
    .send(message);
  expect(res.body[res.body.length - 1].content).toEqual(message.content);
});

it('other user can delete dialogue', async () => {
  let res = await request(app)
    .post('/chat')
    .set('Cookie', [authCookie])
    .send(chat);
  const createdChat = res.body;

  res = await request(app)
    .delete(`/chat/${createdChat.id}`)
    .set('Cookie', [anotherAuthCookie]);
  expect(res.statusCode).toEqual(200);
  expect(getDb().get('chats').find({id: createdChat.id}).value()).toBeFalsy();
});

it('other user can post message to dialogue', async () => {
  await request(app)
    .post('/message')
    .set('Cookie', [anotherAuthCookie])
    .send(message);

  const res = await request(app)
    .get(`/message/?chatId=${createdChat.id}`)
    .set('Cookie', [anotherAuthCookie]);
  expect(res.body[res.body.length - 1].content).toEqual(message.content);
});

it('user can view dialogue in list', async () => {
  let res = await request(app)
    .post('/chat')
    .set('Cookie', [authCookie])
    .send(chat);
  const createdChat = res.body;

  res = await request(app)
    .get(`/chat/?participantId=${user.id}`)
    .set('Cookie', [authCookie]);
  expect(res.body[res.body.length - 1].id).toEqual(createdChat.id);
});

it('other user can view dialogue in list', async () => {
  let res = await request(app)
    .post('/chat')
    .set('Cookie', [authCookie])
    .send(chat);
  const createdChat = res.body;

  res = await request(app)
    .get(`/chat/?participantId=${user.id}`)
    .set('Cookie', [anotherAuthCookie]);
  expect(res.body[res.body.length - 1].id).toEqual(createdChat.id);
});
