const AbstractObject = require('./abstract-object');

const chats = new Map();

class Chat extends AbstractObject {

  constructor(params) {
    super(params);

    const {title, ownerId} = params;

    this.title = title;
    this.ownerId = ownerId;
    this.participants = new Map();
    this.isPrivate = false; // TODO
    this.messages = new Map();
  }

  addPaticipant(user) {
    this.participants.set(user.id, user);
  }

  addMessage(message) {
    this.messages.set(message.id, message);
  }

  toJSON() {
    return {
      ...this,
      participants: [...this.participants.values()],
      messages: [...this.messages.values()],
    }
  }

}

module.exports = {
  chats,

  createChat: (params) => {
    const {title, ownerId} = params;
    const chat = new Chat({
      title,
      ownerId
    });
    chats.set(chat.id, chat);
    return chat;
  }
};
