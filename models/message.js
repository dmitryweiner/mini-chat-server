const AbstractObject = require('./abstract-object');
const { BadRequestError } = require('../server/error-handler');
const db = require('../db').getDb();

class Message extends AbstractObject {
  validate() {
    if (typeof this.content === 'undefined' || this.content.length === 0) {
      throw new BadRequestError('No content for message provided');
    }
  }
}

module.exports = {
  createMessage: (params) => {
    const message = new Message(params)
    message.validate();
    db.get('messages').push(message).write();
    return message;
  }
};
