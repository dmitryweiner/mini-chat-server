const request = require('supertest');
const app = require('../server');
const { generateRandomString } = require('../utils.js');

function generateRandomUser() {
  return {
    nickname: generateRandomString(10),
    password: generateRandomString(10)
  };
}

describe('Users', () => {
  it('should create a new user', async () => {
    const user = generateRandomUser();
    const res = await request(app)
      .post('/register')
      .send(user);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('user.token');
  });

  it('should not create an empty user', async () => {
    const res = await request(app)
      .post('/register')
      .send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should not create an duplicate user', async () => {
    const user = generateRandomUser();
    const res = await request(app)
      .post('/register')
      .send(user);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('user.token');

    const res2 = await request(app)
      .post('/register')
      .send(user);
    expect(res2.statusCode).toEqual(400);
    expect(res2.body).toHaveProperty('error');
  });

  it('should not log in if no user created', async () => {
    const user = generateRandomUser();

    const res = await request(app)
      .post('/login')
      .send(user);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should log in after registration', async () => {
    const user = generateRandomUser();
    await request(app)
      .post('/register')
      .send(user);

    const res = await request(app)
      .post('/login')
      .send(user);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('user.token');
  });

  it('should not log in with wrong password', async () => {
    const user = generateRandomUser();
    await request(app)
      .post('/register')
      .send(user);

    const res = await request(app)
      .post('/login')
      .send({...user, password: '123'});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

});
