const request = require('supertest');
const app = require('../server');
const { cleanTestDb, getDb } = require('../db');
const { generateRandomUser } = require('./test-utils');
const db = getDb();
afterAll(() => {
  cleanTestDb();
});

describe('Auth', () => {
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
    expect(res2.headers['set-cookie'].length).toBe(1); // should be 2
    expect(res2.headers['set-cookie'][0]).toMatch(`token=${token.value}`);
  });
});
