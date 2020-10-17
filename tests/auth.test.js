const request = require('supertest');
const app = require('../server');
const { cleanDb } = require('../db');

afterAll(() => {
  //cleanDb();
});

describe('Auth', () => {
  it('should authenticate', async () => {
    const user = { nickname: '123', password: '!@3' };
    const res = await request(app)
      .post('/auth')
      .send(user);
    console.log(res.body);
  });
});


