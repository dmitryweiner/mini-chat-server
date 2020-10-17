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

  /*
  it('should not log in if no user created', async () => {
    const user = generateRandomUser();

    const res = await request(app)
      .post('/user')
      .send(user);
    expect(res.statusCode).toEqual(404);
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
  */
});
