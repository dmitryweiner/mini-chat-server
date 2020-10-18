const request = require('supertest');
const app = require('../server');
const { cleanTestDb, getDb } = require('../db');
const { generateRandomUser } = require('./test-utils');
const db = getDb();
afterAll(() => {
  cleanTestDb();
});

describe('Auth', () => {
  it('should not login with wrong password', async () => {
    const user = generateRandomUser();
    const res = await request(app)
      .post('/user')
      .send(user);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('nickname');

    user.password = '';
    const res2 = await request(app)
      .post('/auth')
      .send(user);
    expect(res2.statusCode).toEqual(400);
  });

  it('should create user and authenticate', async () => {
    const user = generateRandomUser();
    const res = await request(app)
      .post('/user')
      .send(user);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('nickname');
    const createdUser = res.body;

    const res2 = await request(app)
      .post('/auth')
      .send(user);
    const token = db.get('tokens').find({userId: createdUser.id}).value();
    expect(res2.statusCode).toEqual(200);
    expect(res2.headers['set-cookie'].length).toBe(1);
    expect(res2.headers['set-cookie'][0]).toMatch(`token=${token.token}`);
  });

  it('should authenticate and logout', async () => {
    const user = generateRandomUser();
    const res = await request(app)
      .post('/user')
      .send(user);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('nickname');

    const res2 = await request(app)
      .post('/auth')
      .send(user);
    const authCookie = res2.headers['set-cookie'][0];

    const res3 = await request(app)
      .delete('/auth')
      .set('Cookie', [authCookie])
      .send();
    expect(res3.statusCode).toEqual(200);
    expect(res3.headers['set-cookie'][0]).toMatch('token=;');
  });

  it('should not authenticate with wrong token', async () => {
    const user = generateRandomUser();
    const res = await request(app)
      .post('/user')
      .send(user);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('nickname');

    await request(app)
      .post('/auth')
      .send(user);

    const res3 = await request(app)
      .delete('/auth')
      .set('Cookie', ['token=234'])
      .send();
    expect(res3.statusCode).toEqual(401);
  });
});
