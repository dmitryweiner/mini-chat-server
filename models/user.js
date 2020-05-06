const utils = require('../utils');
const crypto = require('crypto');
const AbstractObject = require('./abstract-object');

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
    this.renewToken();
  }

  checkPassword(password) {
    return this.password === generateHash(password);
  }

  checkToken(token) {
    return this.token === token && (new Date - this.lastActivity < TOKEN_TTL);
  }

  renewToken() {
    this.lastActivity = new Date();
    this.token = utils.generateRandomString(TOKEN_LENGTH);
  }
}

function findUserByNickname(nickname) {
  return [...users.values()].find(user => user.nickname === nickname);
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
    users.set(user.id, user);
    return user;
  },

  login: (params) => {
    const {nickname, password} = params;

    const user = findUserByNickname(nickname);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.checkPassword(password)) {
      user.renewToken();
    } else {
      throw new Error('Wrong password');
    }
    return user;
  },

  checkToken: (params) => {
    const {userId, token} = params;

    const user = users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.checkToken(token)) {
      throw new Error('Token expired');
    }
    return true;
  }

};
