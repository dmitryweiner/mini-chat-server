# Simple chat demo server
It uses lowdb.js as storage engine for more simplicity. You can use memory instead.

## Technologies
* Express.js
* Jest
* Supertest
* DB https://github.com/typicode/lowdb

## How to use

* Install all dependencies.

  `npm install` 

* Run server.

  `npm run start` 

* Run tests.

  `npm run test` 

* Run ES linter.

  `npm run lint` 
  
## API reference

|          	| GET                                                                                                                                            	| POST           	| PUT          	| DELETE         	|
|----------	|------------------------------------------------------------------------------------------------------------------------------------------------	|----------------	|--------------	|----------------	|
| /auth    	| check auth                                                                                                                                     	| login          	| renew token? 	| logout         	|
| /user    	| / get own profile<br><br>/:id get user by ID<br><br>/?nickname= search by nickname                                                          	    | create account 	| edit profile 	| delete profile 	|
| /chat    	| /:id get specific chat<br><br>/?userId= find chats by owner ID<br><br>/?participantId= find chats by participant<br><br>/?title= find by title 	| create chat    	| update chat  	| delete chat    	|
| /message 	| /?chatId= get messages of specific chat                                                                                                        	| create message 	| edit message 	| delete message 	|

### How to authenticate
Send POST /auth {nickname, password}
Cookie token=TOKEN will be set. It is httpOnly cookie.
All routes except POST /auth should be used with cookie token=TOKEN

## API entities
### Auth
```json
{
  "nickname": "test",
  "password": "123"
}
```

### User
```json
{
  "id": "a17413f820d48",
  "creationDate": "2020-10-20T03:48:24.718Z",
  "nickname": "test",
  "password": "86f528316f7de04229d53692a5ae69461d873ba4b13ff4ce16e7ef538c368d65"
}
```

### Chat
```json
{
  "id": "853d59e4a2b8e",
  "creationDate": "2020-10-20T03:48:24.735Z",
  "title": "Super chat",
  "userId": "a17413f820d48",
  "participants": [
    "a17413f820d48"
  ],
  "isPrivate": false
}
```

### Message
```json
{
  "id": "5204cc9d39cfc",
  "creationDate": "2020-10-20T03:48:24.741Z",
  "content": "Here I write my message",
  "userId": "a17413f820d48",
  "chatId": "853d59e4a2b8e"
}
```

## TODO:
* Logging
* Chat:
  * Join chat
  * Delete chat
* User:
  * Update user profile
  * Delete user profile
  * Add to friends list
* Message: 
  * Delete message
  * Edit message
