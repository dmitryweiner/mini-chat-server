const AbstractObject = require('./abstract-object');
const db = require('../db').getDb();

class Chat extends AbstractObject {
  constructor(params) {
    super(params);

    if (params.title.length === 0) {
      throw new Error('No title provided');
    }

    for (const field in params) {
      this[field] = params[field];
    }
    this.participants = [];
    this.isPrivate = false; // TODO
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
    chat.addParticipant(userId);
    db.get('chats').push(chat).write();
    return chat;
  },

  getChatById(id) {
    return db.get('chats').find({id}).value();
  }
};
