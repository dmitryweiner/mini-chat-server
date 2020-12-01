const request = require('supertest');
const app = require('../server');
const { getDb, cleanTestDb } = require('../db');
const { generateRandomUser } = require('./test-utils');

let user,
  authCookie,
  anotherUser,
  anotherAuthCookie,
  dialogue,
  createdDialogue,
  message;

beforeAll(async () => {
  const createdUser = generateRandomUser();
  let res = await request(app).post('/user').send(createdUser);
  user = res.body;
  res = await request(app).post('/auth').send(createdUser);
  authCookie = res.headers['set-cookie'][0];

  const createdAnotherUser = generateRandomUser();
  res = await request(app).post('/user').send(createdAnotherUser);
  anotherUser = res.body;
  res = await request(app).post('/auth').send(createdAnotherUser);
  anotherAuthCookie = res.headers['set-cookie'][0];

  dialogue = {
    participants: [anotherUser.id],
    isDialogue: true
  };
});

afterAll(() => {
  cleanTestDb();
});

it('user can create dialogue', async () => {
  let res = await request(app)
    .post('/chat')
    .set('Cookie', [authCookie])
    .send(dialogue);
  createdDialogue = res.body;
  expect(res.statusCode).toEqual(200);
  expect(res.body).toHaveProperty('isDialogue');
  expect(res.body.userId).toBeFalsy();
  expect(res.body.isDialogue).toBeTruthy();
  expect(res.body.participants).toEqual([user.id, anotherUser.id]);

  res = await request(app)
    .post('/chat')
    .set('Cookie', [authCookie])
    .send(dialogue);
  expect(res.statusCode).toEqual(303);
  expect(res.body.id).toEqual(createdDialogue.id);
});

it('user can post message to a dialogue', async () => {
  message = {
    chatId: createdDialogue.id,
    content: 'test'
  };
  let res = await request(app)
    .post('/message')
    .set('Cookie', [authCookie])
    .send(message);
  expect(res.statusCode).toEqual(200);

  res = await request(app)
    .get(`/message/?chatId=${createdDialogue.id}`)
    .set('Cookie', [authCookie]);
  expect(res.body[res.body.length - 1].content).toEqual(message.content);
});

it('user can view dialogue in list', async () => {
  const res = await request(app)
    .get(`/chat/?participantId=${user.id}`)
    .set('Cookie', [authCookie]);
  expect(res.body[res.body.length - 1].id).toEqual(createdDialogue.id);
});

it('user can delete dialogue', async () => {
  const res = await request(app)
    .delete(`/chat/${createdDialogue.id}`)
    .set('Cookie', [authCookie])
    .send();
  expect(res.statusCode).toEqual(200);
  expect(
    getDb().get('chats').find({ id: createdDialogue.id }).value()
  ).toBeFalsy();
});

it('other user can create dialogue', async () => {
  dialogue.participants = [user.id];
  let res = await request(app)
    .post('/chat')
    .set('Cookie', [anotherAuthCookie])
    .send(dialogue);
  createdDialogue = res.body;
  expect(res.statusCode).toEqual(200);
  expect(res.body).toHaveProperty('isDialogue');
  expect(res.body.userId).toBeFalsy();
  expect(res.body.isDialogue).toBeTruthy();
  expect(res.body.participants).toEqual([anotherUser.id, user.id]);

  res = await request(app)
    .post('/chat')
    .set('Cookie', [authCookie])
    .send(dialogue);
  expect(res.statusCode).toEqual(303);
  expect(res.body.id).toEqual(createdDialogue.id);
});

it('other user can post message to dialogue', async () => {
  message.chatId = createdDialogue.id;
  await request(app)
    .post('/message')
    .set('Cookie', [anotherAuthCookie])
    .send(message);

  const res = await request(app)
    .get(`/message/?chatId=${createdDialogue.id}`)
    .set('Cookie', [anotherAuthCookie]);
  expect(res.body[res.body.length - 1].content).toEqual(message.content);
});

it('other user can view dialogue in list', async () => {
  const res = await request(app)
    .get(`/chat/?participantId=${user.id}`)
    .set('Cookie', [anotherAuthCookie]);
  expect(res.body[res.body.length - 1].id).toEqual(createdDialogue.id);
});

it('other user can delete dialogue', async () => {
  const res = await request(app)
    .delete(`/chat/${createdDialogue.id}`)
    .set('Cookie', [anotherAuthCookie])
    .send();
  expect(res.statusCode).toEqual(200);
  expect(
    getDb().get('chats').find({ id: createdDialogue.id }).value()
  ).toBeFalsy();
});
