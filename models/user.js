const db = require('../db').getDb();
const utils = require('../utils');
const crypto = require('crypto');
const AbstractObject = require('./abstract-object');
const { BadRequestError, NotFoundError, AuthError } = require('../server/error-handler');

const TOKEN_LENGTH = 30;
const TOKEN_TTL = 24 * 60 * 60 * 1000; // One day in ms
const PASSWORD_MIN_LENGTH = 6;

class User extends AbstractObject {
  constructor (params = {}) {
    super(params);
    this.nickname = params.nickname;
    this.password = params.password;
  }

  validate() {
    if (!this.nickname || !this.password) {
      throw new BadRequestError('No nickname or password passed');
    }

    if (this.password.length < PASSWORD_MIN_LENGTH) {
      throw new BadRequestError('Password too short');
    }
  }

  setPassword(password) {
    this.password = User.generateHash(password);
  }

  checkPassword(password) {
    return this.password === User.generateHash(password);
  }

  getWithoutSomeFields(fields = []) {
    const result = {};
    for (const key in this) {
      if (!fields.includes(key)) {
        result[key] = this[key];
      }
    }
    return result;
  }

  static createUser (params) {
    const {nickname} = params;

    if (User.getByNickname(nickname)) {
      throw new BadRequestError('User with this nickname already exists');
    }

    const user = new User(params);
    user.validate();
    user.setPassword(params.password);
    db.get('users').push(user).write();
    return user;
  }

  static login ({nickname, password}) {
    const user = User.getByNickname(nickname);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.checkPassword(password)) {
      const token = utils.generateRandomString(TOKEN_LENGTH);

      // delete all old tokens
      db.get('tokens').remove({
        userId: user.id
      }).write();

      // create a new one
      db.get('tokens').push({
        userId: user.id,
        token,
        createdAt: new Date()
      }).write();
      return token;
    } else {
      throw new AuthError('Wrong password');
    }
  }

  static logout (token) {
    db.get('tokens').remove({
      token
    }).write();
  }

  static checkToken (token) {
    const foundToken = db.get('tokens').find({token}).value();

    if (!foundToken) {
      throw new AuthError('Token not found');
    }

    if (new Date() - foundToken.createdAt > TOKEN_TTL) {
      throw new AuthError('Token expired');
    }
  }

  static getByToken (token) {
    const tokenObj = db.get('tokens').find({token}).value();
    return User.getById(tokenObj.userId);
  }

  static getByNickname(nickname) {
    return new User().hydrate((db.get('users').find({nickname}).value()));
  }

  static getById(id) {
    return new User().hydrate(db.get('users').find({id}).value());
  }

  static generateHash(str) {
    return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
  }
}

module.exports = User;
