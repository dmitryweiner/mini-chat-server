# Simple chat demo server
Stores all its data to memory. Easy to erase.

## Technologies
* Express.js
* Jest
* Supertest

## How to use

* Install all dependencies.

  `npm install` 

* Run server.

  `npm run start` 

* Run tests.

  `npm run test` 

* Run ES linter.

  `npm run lint` 
  
* Create user, chat and message.

  `npm run create-live-data` 

* Create message in existing chat.

  `npm run create-live-data -- --nickname=test --password=test --chatId=df513b6e4dec1 --message=Test123` 

## TODO:
* Save data to DB (mongo?)
* Implement contact list
* Implement adding to contact list
* ... search in users list
* ... search in chats list
