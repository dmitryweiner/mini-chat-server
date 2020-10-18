const AbstractObject = require('./abstract-object');
const db = require('../db').getDb();

class Message extends AbstractObject {
  constructor(params) {
    super(params);

    if (params.content.length === 0) {
      throw new Error('No content for message provided');
    }

    for (const field in params) {
      this[field] = params[field];
    }
  }
}

module.exports = {
  createMessage: (params) => {
    const message = new Message(params);
    db.get('messages').push(message).write();
    return message;
  }
};
