const request = require('supertest');
const { cleanTestDb } = require('../db');
const app = require('../server');
const { generateRandomUser } = require('./test-utils');

afterAll(() => {
  cleanTestDb();
});

describe('User', () => {
  it('should create a new user', async () => {
    const user = generateRandomUser();
    const res = await request(app)
      .post('/user')
      .send(user);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('nickname');
  });

  it('should not create an empty user', async () => {
    const res = await request(app)
      .post('/user')
      .send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should not create user with short password', async () => {
    const user = generateRandomUser();
    user.password = '123';
    const res = await request(app)
      .post('/user')
      .send(user);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should not create an duplicate user', async () => {
    const user = generateRandomUser();
    const res = await request(app)
      .post('/user')
      .send(user);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('nickname');

    const res2 = await request(app)
      .post('/user')
      .send(user);
    expect(res2.statusCode).toEqual(400);
    expect(res2.body).toHaveProperty('error');
  });

  it('should get logged user profile', async () => {
    const user = generateRandomUser();

    // create user
    let res = await request(app)
      .post('/user')
      .send(user);
    const createdUser = res.body;

    // logging in
    res = await request(app)
      .post('/auth')
      .send(user);
    const authCookie = res.headers['set-cookie'][0];

    // getting own profile
    res = await request(app)
      .get('/user')
      .set('Cookie', [authCookie]);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toEqual(createdUser.id);
    expect(res.body).not.toHaveProperty('password');
  });

  it('should get another user profile by ID', async () => {
    const user = generateRandomUser();
    const anotherUser = generateRandomUser();

    // create users
    await request(app)
      .post('/user')
      .send(user);
    let res = await request(app)
      .post('/user')
      .send(anotherUser);
    const anoterUserRegistered = res.body;

    // logging in
    res = await request(app)
      .post('/auth')
      .send(user);
    const authCookie = res.headers['set-cookie'][0];

    // getting another user profile
    res = await request(app)
      .get(`/user/${anoterUserRegistered.id}`)
      .set('Cookie', [authCookie]);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toEqual(anoterUserRegistered.id);
    expect(res.body).not.toHaveProperty('password');
  });

  it('should search users by title', async () => {
    const user = {
      nickname: 'test',
      password: '1234567'
    };

    let res = await request(app)
      .post('/user')
      .send(user);
    const registeredUser = res.body;

    res = await request(app)
      .post('/auth')
      .send(user);
    const authCookie = res.headers['set-cookie'][0];

    res = await request(app)
      .get(`/user/?nickname=${registeredUser.nickname.toUpperCase()}`)
      .set('Cookie', [authCookie]);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0].id).toEqual(registeredUser.id);
    expect(res.body[0]).not.toHaveProperty('password');
  });
});
