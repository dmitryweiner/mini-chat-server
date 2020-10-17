const db = require('../db').getDb();
const utils = require('../utils');
const crypto = require('crypto');
const AbstractObject = require('./abstract-object');
const { NotFoundError, AuthError } = require('../server/error-handler');

const TOKEN_LENGTH = 30;
const TOKEN_TTL = 24 * 60 * 60 * 1000; // One day in ms

const users = new Map();

class User extends AbstractObject {
  constructor (params) {
    super(params);

    const { nickname, password } = params;
    if (!nickname || !password) {
      throw new Error('No nickname or password passed');
    }

    this.nickname = nickname;
    this.password = generateHash(password);
  }

  checkPassword(password) {
    return this.password === generateHash(password);
  }

  checkToken(token) {
    return this.token === token && (new Date() - this.lastActivity < TOKEN_TTL);
  }

  renewToken() {
    this.lastActivity = new Date();
    this.token = utils.generateRandomString(TOKEN_LENGTH);
  }

  updateLastActivity() {
    this.lastActivity = new Date();
  }
}

function findUserByNickname(nickname) {
  return db.get('users').find({nickname}).value();
}

function generateHash(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

module.exports = {
  users,

  createUser: (params) => {
    const {nickname} = params;

    if (findUserByNickname(nickname)) {
      throw new Error('User with this nickname already exists');
    }

    const user = new User(params);
    db.get('users').push(user).write();
    return user;
  },

  login: ({nickname, password}) => {
    const user = findUserByNickname(nickname);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.checkPassword(password)) {
      const token = utils.generateRandomString(TOKEN_LENGTH);
      db.get('tokens').push({
        userId: user.id,
        value: token,
        createdAt: new Date()
      }).write();
      return token;
    } else {
      throw new Error('Wrong password');
    }
  },

  checkToken: (params) => {
    const {userId, token} = params;

    const user = users.get(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.checkToken(token)) {
      throw new AuthError('Token expired');
    }
    return true;
  }
};
