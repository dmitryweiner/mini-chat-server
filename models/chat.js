const AbstractObject = require('./abstract-object');
const { BadRequestError } = require('../server/error-handler');
const db = require('../db').getDb();

/**
 * @class Chat
 */
class Chat extends AbstractObject {
  constructor(params = {}) {
    super(params);
    this.title = params.title;
    this.userId = params.userId;
    this.participants = params.participants ? params.participants : [];
    this.isDialogue = params.isDialogue;
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

  edit({title}) {
    this.title = title;
    this.validate();
  }

  /**
   * @param {object} params chat creation params
   * @param {string} params.title chat title
   * @param {string} params.userId owner id
   * @param {boolean} params.isDialogue is this chat actually dialogue
   * @returns {Chat} created chat
   */
  static createChat ({ title, userId, isDialogue }) {
    const chat = new Chat({
      title,
      userId,
      isDialogue
    });
    chat.validate();
    if (isDialogue) {
      chat.addParticipants(userId);
    } else {
      chat.addParticipant(userId);
    }
    db.get('chats').push(chat).write();
    return chat;
  }

  /**
   * @param {object} params dialogue creation params
   * @param {string[]} params.participants participants IDs
   * @returns {Chat} created chat
   */
  static createDialogue ({ participants }) {
    const chat = new Chat({
      title: 'dialogue',
      userId: null,
      isDialogue: true,
      participants
    });
    chat.validate();
    db.get('chats').push(chat).write();
    return chat;
  }

  /**
   * @param {string} id chat ID
   * @returns {undefined|Chat} found chat
   */
  static getById(id) {
    return new Chat().hydrate(db.get('chats').find({id}).value());
  }
}

module.exports = Chat;
