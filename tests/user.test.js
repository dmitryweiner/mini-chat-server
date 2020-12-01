const request = require('supertest');
const { cleanTestDb } = require('../db');
const app = require('../server');
const { generateRandomUser } = require('./test-utils');

let user;
let registeredUser;
let authCookie;
beforeAll(async () => {
  user = generateRandomUser();
  let res = await request(app).post('/user').send(user);
  registeredUser = res.body;

  res = await request(app).post('/auth').send(user);
  authCookie = res.headers['set-cookie'][0];
});

afterAll(() => {
  cleanTestDb();
});

describe('User', () => {
  it('should create a new user', async () => {
    const user = generateRandomUser();
    const res = await request(app).post('/user').send(user);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('nickname');
  });

  it('should not create an empty user', async () => {
    const res = await request(app).post('/user').send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should not create user with short password', async () => {
    const user = generateRandomUser();
    user.password = '123';
    const res = await request(app).post('/user').send(user);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should not create an duplicate user', async () => {
    const res2 = await request(app).post('/user').send(user);
    expect(res2.statusCode).toEqual(400);
    expect(res2.body).toHaveProperty('error');
  });

  it('should get logged user profile', async () => {
    const res = await request(app).get('/user').set('Cookie', [authCookie]);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toEqual(registeredUser.id);
    expect(res.body).not.toHaveProperty('password');
  });

  it('should get another user profile by ID', async () => {
    const anotherUser = generateRandomUser();

    // create user
    let res = await request(app).post('/user').send(anotherUser);
    const anotherUserRegistered = res.body;

    // getting another user profile
    res = await request(app)
      .get(`/user/${anotherUserRegistered.id}`)
      .set('Cookie', [authCookie]);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toEqual(anotherUserRegistered.id);
    expect(res.body).not.toHaveProperty('password');
  });

  it('should search users by title', async () => {
    const newUser = {
      nickname: 'test',
      password: '1234567'
    };

    let res = await request(app).post('/user').send(newUser);
    const registeredUser = res.body;

    res = await request(app)
      .get(`/user/?nickname=${registeredUser.nickname.toUpperCase()}`)
      .set('Cookie', [authCookie]);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0].id).toEqual(registeredUser.id);
    expect(res.body[0]).not.toHaveProperty('password');
  });

  it('should update user password', async () => {
    const newPassword = 'new_password';

    let res = await request(app)
      .put('/user')
      .send({
        password: '123'
      })
      .set('Cookie', [authCookie]);
    expect(res.statusCode).toEqual(400);

    res = await request(app)
      .put('/user')
      .send({
        password: newPassword
      })
      .set('Cookie', [authCookie]);
    expect(res.statusCode).toEqual(200);

    res = await request(app).post('/auth').send({
      nickname: user.nickname,
      password: newPassword
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});
