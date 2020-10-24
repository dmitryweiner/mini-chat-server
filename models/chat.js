const AbstractObject = require('./abstract-object');
const { BadRequestError } = require('../server/error-handler');
const db = require('../db').getDb();

class Chat extends AbstractObject {
  constructor(params = {}) {
    super(params);
    this.title = params.title;
    this.userId = params.userId;
    this.participants = [];
    this.isPrivate = false; // TODO
  }

  validate() {
    if (typeof this.title === 'undefined' || this.title.length === 0) {
      throw new BadRequestError('No title provided');
    }
  }

  addParticipant(userId) {
    // leave only unique IDs
    this.participants = [
      ...new Set([
        ...this.participants,
        userId
      ]).values()
    ];
  }

  static createChat ({title, userId}) {
    const chat = new Chat({
      title,
      userId
    });
    chat.validate();
    chat.addParticipant(userId);
    db.get('chats').push(chat).write();
    return chat;
  }

  static getById(id) {
    return new Chat().hydrate(db.get('chats').find({id}).value());
  }
}

module.exports = Chat;
