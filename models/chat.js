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
    this.isPrivate = params.isPrivate;
  }

  validate() {
    if (typeof this.title === 'undefined' || this.title.length === 0) {
      throw new BadRequestError('No title provided');
    }

    if (typeof this.title !== 'string') {
      throw new BadRequestError('Title should be a string');
    }
  }

  addParticipant(userId) {
    // leave only unique IDs
    this.participants = [...new Set([...this.participants, userId]).values()];
  }

  edit({ title, isPrivate }) {
    if (typeof title !== 'undefined') {
      this.title = title;
    }

    if (typeof isPrivate !== 'undefined') {
      this.isPrivate = isPrivate;
    }

    this.validate();
  }

  /**
   * @param {object} params chat creation params
   * @param {string} params.title chat title
   * @param {string} params.userId owner id
   * @param {boolean} params.isPrivate if the chat private
   * @returns {Chat} created chat
   */
  static createChat({ title, userId, isPrivate }) {
    const chat = new Chat({
      title,
      userId,
      isPrivate,
      isDialogue: false
    });
    chat.validate();
    chat.addParticipant(userId);
    db.get('chats').push(chat).write();
    return chat;
  }

  /**
   * @param {object} params dialogue creation params
   * @param {string[]} params.participants participants IDs
   * @returns {Chat} created chat
   */
  static createDialogue({ participants }) {
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
    return new Chat().hydrate(db.get('chats').find({ id }).value());
  }

  /**
   * @param {string} participantId
   * @returns {null|Chat[]}
   */
  static getByParticipantId(participantId) {
    return db
      .get('chats')
      .filter(chat => chat.participants.includes(participantId))
      .value();
  }

  /**
   * @param {string} userId
   * @returns {boolean}
   */
  isParticipant(userId) {
    return this.participants.includes(userId);
  }

  /**
   *
   * @param {string[]} ids it should consist at least 2 elements
   * @returns {Chat | null}
   */
  static getDialogueByParticipantIds(ids) {
    const result = db
      .get('chats')
      .filter(
        chat =>
          chat.isDialogue &&
          chat.participants.includes(ids[0]) &&
          chat.participants.includes(ids[1])
      )
      .take(1)
      .value();
    if (result.length) {
      return result[0];
    }
    return null;
  }
}

module.exports = Chat;
