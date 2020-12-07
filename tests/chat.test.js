const request = require('supertest');
const app = require('../server');
const Chat = require('../models/chat');
const { cleanTestDb } = require('../db');
const { generateRandomUser, generateRandomChat } = require('./test-utils');

let authCookie;
let authUser;
beforeAll(async () => {
  const user = generateRandomUser();
  const res = await request(app).post('/user').send(user);
  authUser = res.body;
  const res2 = await request(app).post('/auth').send(user);
  authCookie = res2.headers['set-cookie'][0];
});

afterAll(() => {
  cleanTestDb();
});

describe('Chat', () => {
  it('should create chat with title', async () => {
    const chat = generateRandomChat();
    const res = await request(app)
      .post('/chat')
      .set('Cookie', [authCookie])
      .send(chat);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title');
    expect(res.body.title).toEqual(chat.title);
  });

  it('should create private chat not accessible in search', async () => {
    const chat = generateRandomChat();
    chat.isPrivate = true;
    let res = await request(app)
      .post('/chat')
      .set('Cookie', [authCookie])
      .send(chat);
    expect(res.body.isPrivate).toBeTruthy();

    res = await request(app)
      .get(`/chat/?title=${chat.title}`)
      .set('Cookie', [authCookie]);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(0);
  });

  it('should not create chat with wrong fields', async () => {
    const chat = generateRandomChat();
    chat.title = '';
    let res = await request(app)
      .post('/chat')
      .set('Cookie', [authCookie])
      .send(chat);
    expect(res.statusCode).toEqual(400);

    chat.title = { a: 1 };
    res = await request(app)
      .post('/chat')
      .set('Cookie', [authCookie])
      .send(chat);
    expect(res.statusCode).toEqual(400);

    chat.title = false;
    res = await request(app)
      .post('/chat')
      .set('Cookie', [authCookie])
      .send(chat);
    expect(res.statusCode).toEqual(400);
  });

  it('should be accessible by id', async () => {
    const chat = generateRandomChat();
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

  it('should be accessible by author id', async () => {
    const res = await request(app)
      .get(`/chat/?userId=${authUser.id}`)
      .set('Cookie', [authCookie]);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(3);
    expect(res.body[0]).toHaveProperty('title');
  });

  it('should be accessible by participant id', async () => {
    const res = await request(app)
      .get(`/chat/?participantId=${authUser.id}`)
      .set('Cookie', [authCookie]);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(3);
    expect(res.body[0]).toHaveProperty('title');
  });

  it('should search by chat title', async () => {
    const chat = {
      title: 'unique'
    };
    await request(app).post('/chat').set('Cookie', [authCookie]).send(chat);

    const res = await request(app)
      .get(`/chat/?title=${chat.title.toUpperCase()}`)
      .set('Cookie', [authCookie]);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0]).toHaveProperty('title');
    expect(res.body[0].title).toEqual(chat.title);
  });

  it('user should be able to joint to chat', async () => {
    const chat = generateRandomChat();
    let res = await request(app)
      .post('/chat')
      .set('Cookie', [authCookie])
      .send(chat);
    const createdChat = res.body;

    const anotherUser = generateRandomUser();
    res = await request(app).post('/user').send(anotherUser);
    const anotherUserRegistered = res.body;
    res = await request(app).post('/auth').send(anotherUser);
    const anotherAuthCookie = res.headers['set-cookie'][0];
    res = await request(app)
      .put(`/chat/${createdChat.id}`)
      .set('Cookie', [anotherAuthCookie])
      .send();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('participants');
    expect(res.body.participants).toContain(anotherUserRegistered.id);
  });

  it('should be able to edit own chat', async () => {
    const chat = generateRandomChat();
    let res = await request(app)
      .post('/chat')
      .set('Cookie', [authCookie])
      .send(chat);
    const createdChat = res.body;

    res = await request(app)
      .put(`/chat/${createdChat.id}`)
      .set('Cookie', [authCookie])
      .send({ title: '123' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title');
    expect(res.body.title).toBe('123');
  });

  it("should not be able to edit someone's chat", async () => {
    const chat = generateRandomChat();
    let res = await request(app)
      .post('/chat')
      .set('Cookie', [authCookie])
      .send(chat);
    const createdChat = res.body;

    const anotherUser = generateRandomUser();
    res = await request(app).post('/user').send(anotherUser);
    res = await request(app).post('/auth').send(anotherUser);
    const anotherAuthCookie = res.headers['set-cookie'][0];
    res = await request(app)
      .put(`/chat/${createdChat.id}`)
      .set('Cookie', [anotherAuthCookie])
      .send({ title: '123' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title');
    expect(res.body.title).not.toBe('123');
  });

  it('user should be able to delete his own chat', async () => {
    const chat = generateRandomChat();
    chat.userId = authUser.id;
    let res = await request(app)
      .post('/chat')
      .set('Cookie', [authCookie])
      .send(chat);
    const createdChat = res.body;

    res = await request(app)
      .delete(`/chat/${createdChat.id}`)
      .set('Cookie', [authCookie])
      .send();
    expect(res.statusCode).toEqual(200);
    expect(Chat.getById(createdChat.id)).toBeFalsy();
  });

  it("another user should not be able to delete someone's chat", async () => {
    const chat = generateRandomChat();
    chat.userId = authUser.id;
    let res = await request(app)
      .post('/chat')
      .set('Cookie', [authCookie])
      .send(chat);
    const createdChat = res.body;

    const anotherUser = generateRandomUser();
    await request(app).post('/user').send(anotherUser);
    res = await request(app).post('/auth').send(anotherUser);
    const anotherAuthCookie = res.headers['set-cookie'][0];
    res = await request(app)
      .delete(`/chat/${createdChat.id}`)
      .set('Cookie', [anotherAuthCookie])
      .send();
    expect(res.statusCode).toEqual(403);
    expect(Chat.getById(createdChat.id)).not.toBeFalsy();
  });
});
