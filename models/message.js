const AbstractObject = require('./abstract-object');

const messages = new Map();

class Message extends AbstractObject {

  constructor(params) {
    super(params);

    const {title, authorId, chatId, content} = params;
    this.title = title;
    this.authorId = authorId;
    this.creationDate = new Date();
    this.chatId = chatId;
    this.content = content;
  }

}

module.exports = {
  messages,

  createMessage: (params) => {
    const message = new Message(params);
    messages.set(message.id, message);
    return message;
  }
};
