const request = require('supertest');
const app = require('../server');
const { generateRandomString } = require('../utils.js');

function generateRandomUser() {
  return {
    nickname: generateRandomString(10),
    password: generateRandomString(10)
  };
}

function generateRandomChat() {
  return {
    title: generateRandomString(10),
  };
}

expect.extend({
  toContainObject(received, argument) {

    const pass = this.equals(received,
      expect.arrayContaining([
        expect.objectContaining(argument)
      ])
    )

    if (pass) {
      return {
        message: () => (`expected ${this.utils.printReceived(received)} not to contain object ${this.utils.printExpected(argument)}`),
        pass: true
      }
    } else {
      return {
        message: () => (`expected ${this.utils.printReceived(received)} to contain object ${this.utils.printExpected(argument)}`),
        pass: false
      }
    }
  }
})

describe('User', () => {
  it('should create a new user', async () => {
    const user = generateRandomUser();
    const res = await request(app)
      .post('/user/register')
      .send(user);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('user.token');
  });

  it('should not create an empty user', async () => {
    const res = await request(app)
      .post('/user/register')
      .send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should not create an duplicate user', async () => {
    const user = generateRandomUser();
    const res = await request(app)
      .post('/user/register')
      .send(user);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('user.token');

    const res2 = await request(app)
      .post('/user/register')
      .send(user);
    expect(res2.statusCode).toEqual(400);
    expect(res2.body).toHaveProperty('error');
  });

  it('should not log in if no user created', async () => {
    const user = generateRandomUser();

    const res = await request(app)
      .post('/user/login')
      .send(user);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should log in after registration', async () => {
    const user = generateRandomUser();
    await request(app)
      .post('/user/register')
      .send(user);

    const res = await request(app)
      .post('/user/login')
      .send(user);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('user.token');
  });

  it('should not log in with wrong password', async () => {
    const user = generateRandomUser();
    await request(app)
      .post('/user/register')
      .send(user);

    const res = await request(app)
      .post('/user/login')
      .send({...user, password: '123'});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

});

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
