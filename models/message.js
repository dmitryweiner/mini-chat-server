const AbstractObject = require('./abstract-object');
const { BadRequestError } = require('../server/error-handler');
const db = require('../db').getDb();

const COLLECTION_NAME = 'messages';

const MESSAGE_TYPE_TEXT = 'text';
const MESSAGE_TYPE_IMAGE = 'image';

class Message extends AbstractObject {
  constructor(params = {}) {
    super(params);
    this.content = params.content;
    this.userId = params.userId;
    this.chatId = params.chatId;
    this.type = params.type ? params.type : MESSAGE_TYPE_TEXT;
    this.mimeType = params.mimeType;
  }

  validate() {
    if (this.type === MESSAGE_TYPE_TEXT) {
      if (typeof this.content === 'undefined' || this.content.length === 0) {
        throw new BadRequestError('No content for a message provided');
      }

      if (typeof this.content !== 'string') {
        throw new BadRequestError('Message content should be a string');
      }
    }
  }

  /**
   * @param {object} params initial params
   * @returns {Message} created message
   */
  static createMessage(params) {
    const message = new Message(params);
    message.validate();
    db.get(COLLECTION_NAME).push(message).write();
    return message;
  }

  toJSON() {
    if (this.type === MESSAGE_TYPE_IMAGE) {
      this.url = `/image/${this.id}`;
    }
    return this;
  }

  /**
   * @param {string} id message ID
   * @returns {undefined|Message} found chat
   */
  static getById(id) {
    return new Message().hydrate(db.get(COLLECTION_NAME).find({ id }).value());
  }

  /**
   * @param {string} chatId
   * @returns {Message[]}
   */
  static getByChatId(chatId) {
    return db
      .get(COLLECTION_NAME)
      .filter({ chatId })
      .value()
      .map(message => new Message().hydrate(message));
  }
}

module.exports = Message;
module.exports.MESSAGE_TYPE_TEXT = MESSAGE_TYPE_TEXT;
module.exports.MESSAGE_TYPE_IMAGE = MESSAGE_TYPE_IMAGE;
