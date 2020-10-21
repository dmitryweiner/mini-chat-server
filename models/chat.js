const AbstractObject = require('./abstract-object');
const db = require('../db').getDb();

class Chat extends AbstractObject {
  constructor(params) {
    super(params);
    this.participants = [];
    this.isPrivate = false; // TODO
  }

  validate() {
    if (this.title.length === 0) {
      throw new Error('No title provided');
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

  addMessage(message) {
    this.messages.set(message.id, message);
  }

  toJSON() {
    return {
      ...this
    };
  }
}

module.exports = {
  createChat: ({title, userId}) => {
    const chat = new Chat({
      title,
      userId
    });
    chat.validate();
    chat.addParticipant(userId);
    db.get('chats').push(chat).write();
    return chat;
  },

  getChatById(id) {
    return new Chat().hydrate(db.get('chats').find({id}).value());
  }
};
