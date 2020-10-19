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
* ~~Save data to DB (mongo? sqlite? https://github.com/typicode/lowdb)~~
* Logging
* Chat:
  * ~~Search chat by title~~
  * Join chat
  * Delete chat
  * ~~Search by user ID~~
  * ~~Search by participant ID~~
* User:
  * Update user profile
  * Delete user profile
  * Search by nickname
  * Get user profile by ID
  * Get own user profile
  * Add to friends list
* Message: 
  * Delete message
  * Edit message
* Write API doc

## API reference
|          	| GET                                                                                                                                            	| POST           	| PUT          	| DELETE         	|
|----------	|------------------------------------------------------------------------------------------------------------------------------------------------	|----------------	|--------------	|----------------	|
| /auth    	| check auth                                                                                                                                     	| login          	| renew token? 	| logout         	|
| /user    	| / get own profile<br><br>/:id get random profile<br><br>/?nickname= search by nickname                                                         	| create account 	| edit profile 	| delete profile 	|
| /chat    	| /:id get specific chat<br><br>/?userId= find chats by owner ID<br><br>/?participantId= find chats by participant<br><br>/?title= find by title 	| create chat    	| update chat  	| delete chat    	|
| /message 	| /?chatId= get messages of specific chat                                                                                                        	| create message 	| edit message 	| delete message 	|
