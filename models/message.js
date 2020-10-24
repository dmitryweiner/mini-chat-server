const AbstractObject = require('./abstract-object');
const { BadRequestError } = require('../server/error-handler');
const db = require('../db').getDb();

class Message extends AbstractObject {
  constructor (params = {}) {
    super(params);
    this.content = params.content;
    this.userId = params.userId;
    this.chatId = params.chatId;
  }

  validate() {
    if (typeof this.content === 'undefined' || this.content.length === 0) {
      throw new BadRequestError('No content for a message provided');
    }
  }

  /**
   * @param {Object} params
   * @returns {Message}
   */
  static createMessage (params) {
    const message = new Message(params);
    message.validate();
    db.get('messages').push(message).write();
    return message;
  }
}

module.exports = Message;
