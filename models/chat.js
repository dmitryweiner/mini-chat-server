const AbstractObject = require('./abstract-object');

const chats = new Map();

class Chat extends AbstractObject {

  constructor(params) {
    super(params);

    const {title, ownerId} = params;

    this.title = title;
    this.ownerId = ownerId;
    this.participants = [ownerId];
    this.isPrivate = false; // TODO
    this.messages = [];
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
