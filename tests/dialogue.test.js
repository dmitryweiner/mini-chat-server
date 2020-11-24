const request = require('supertest');
const app = require('../server');
const { cleanTestDb } = require('../db');
const { generateRandomUser } = require('./test-utils');

let user;
let authCookie;
let anotherUser;
let anotherAuthCookie; // eslint-disable-line
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
it('user can delete dialogue', async () => {});
it('user can post message to dialogue', async () => {});
it('other user can view dialogue', async () => {});
it('other user can delete dialogue', async () => {});
it('other user can post message to dialogue', async () => {});
it('user can view dialogue in list', async () => {});
it('other user can view dialogue in list', async () => {});
