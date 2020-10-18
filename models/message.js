const AbstractObject = require('./abstract-object');

class Message extends AbstractObject {
  constructor(params) {
    super(params);

    const {title, authorId, authorNickname, chatId, content} = params;
    this.authorId = authorId;
    this.authorNickname = authorNickname;
    this.chatId = chatId;
    this.content = content;
  }
}

module.exports = {
  createMessage: (params) => {
    const message = new Message(params);
    messages.set(message.id, message);
    return message;
  }
};
