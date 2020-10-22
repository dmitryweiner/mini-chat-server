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

### /auth
##### POST /auth
Authenticate user. 
Send:
```json
{
  "nickname": "test",
  "password": "123"
}
```
Receive:
```json
{
  "token": "GhkhAgw5JdGo8yLdBlhzOHbUlPaYKr"
}
```
Cookie "token=TOKEN" will be set. It is httpOnly cookie.
_All routes except POST /auth should be used with cookie "token=TOKEN"._

##### GET /auth
Check auth status. Returns 200 if all is OK.

##### DELETE /auth
Logout. Deleting cookie and token.

### /user
Entity:
```json
{
  "id": "a17413f820d48",
  "creationDate": "2020-10-20T03:48:24.718Z",
  "nickname": "test"
}
```
##### POST /user
Create a new user.
Send:
```json
{
  "nickname": "test",
  "password": "test123"
}
```
Receive:
```User```

##### GET /user
Receive currently logged user profile:
```User```

##### GET /user/id
Get user by ID. Receive:
```User```

##### GET /user/?nickname=...
Receive:
```[ User, User, ... ]```

### /chat
Entity:
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
##### POST /chat
Create a new chat. Send:
```json
{
  "title": "Chat title"
}
```
Receive:
```Chat```

##### GET /chat/id
Receive:
```Chat```

##### GET /chat/?title=
Search by chat title. Receive:
```[ Chat, Chat, ... ]```

##### GET /chat/?userId=
Get chats owned by user. Receive:
```[ Chat, Chat, ... ]```

##### GET /chat/?participantId=
Get chats user involved in. Receive:
```[ Chat, Chat, ... ]```

##### DELETE /chat/id
Delete a chat by ID.

### /message
Entity:
```json
{
  "id": "5204cc9d39cfc",
  "creationDate": "2020-10-20T03:48:24.741Z",
  "content": "Here I write my message",
  "userId": "a17413f820d48",
  "chatId": "853d59e4a2b8e"
}
```

##### POST /message
Create a new message. Send:
```json
{
  "content": "Here is my message",
  "chatId": "aa5eaed04c03d"
}
```
Receieve: ```Message```

##### GET /message/?chatId=
Get all messages of current chat.
Receive: ```[ Message, Message, .. ]```

##### DELETE /message/id
Delete a message by ID.

## TODO:
* Logging
* User:
  * Update user profile
  * Delete user profile
  * Add to friends list
* Message: 
  * Delete message
  * Edit message
