const request = require('supertest');
const stdio = require('stdio');
const apiUrl = 'http://localhost:3000';

const options = stdio.getopt({
  'nickname': {description: 'User nickname', args: '*', required: false},
  'password': {description: 'User password', args: '*', required: false},
  'chatId': {description: 'Chat id', args: '*', required: false},
  'dummy': {description: 'dummy', args: '*', required: false}
});

//options.printHelp();

console.log(options);

(async () => {
  const registrationData = {
    nickname: 'test',
    password: 'test'
  };
  let user;
  if (options.nickname && options.password) {
    let res = await request(apiUrl)
      .post('/user/login')
      .send({
        nickname: options.nickname,
        password: options.password
      });
    user = res.body.user;
    console.log('Logged in as user with parameters ', user);
  } else {
    let res = await request(apiUrl)
      .post('/user/register')
      .send(registrationData);
    user = res.body.user;
    console.log('Registered user with parameters ', user);
  }

  let chatId = options.chatId;
  if (!chatId) {
    const chatCreationData = {
      title: 'Test chat'
    };

    res = await request(apiUrl)
      .post('/chat')
      .send({
        chat: chatCreationData,
        userId: user.id,
        token: user.token
      });
    const chat = res.body.chat;
    console.log(`Created chat with id ${chat.id}`);
    chatId = chat.id;
  }

  const message = {
    content: "Test message",
    chatId
  };
  res = await request(apiUrl)
    .post('/message')
    .send({
      chatId,
      userId: user.id,
      token: user.token,
      message
    });
  console.log(`Created message`, res.body);
})();
