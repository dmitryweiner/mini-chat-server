# Simple chat demo server
It uses lowdb.js as storage engine for more simplicity. You can use memory instead.

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
* Save data to DB (mongo? sqlite? https://github.com/typicode/lowdb)
* Logging
* ~~Implement showing my chat list~~ (test)
* ~~Implement adding to contact list~~ 
* ~~Implement joining in chat~~ (test)
* ~~... search in users list~~
* ~~get user profile~~
* ~~... search in chats list~~ (test)
* Write API doc
