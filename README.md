# Simple chat server
It uses lowdb.js as a storage engine for educational purposes.

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

|          	| GET                                                                                                                                            	| POST           	| PUT            	| DELETE                  |
|----------	|------------------------------------------------------------------------------------------------------------------------------------------------	|----------------	|-----------------  |-----------------------  |
| /auth    	| check auth                                                                                                                                     	| login          	| renew token?    	| logout         	      |
| /user    	| / get own profile<br><br>/:id get user by ID<br><br>/?nickname= search by nickname                                                          	    | create account 	| update password 	| delete profile          |
| /chat    	| /:id get specific chat<br><br>/?userId= find chats by owner ID<br><br>/?participantId= find chats by participant<br><br>/?title= find by title 	| create chat    	| update / join   	| delete chat or exit     |
| /message 	| /?chatId= get messages of specific chat                                                                                                        	| create message 	| edit message  	| delete message 	      |

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
  "createdAt": "2020-10-20T03:48:24.718Z",
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

##### PUT /user
Update user password.
Send:
```json
{
  "password": "new_password"
}
```
Receive:
```User```

### /chat
Entity:
```json
{
  "id": "853d59e4a2b8e",
  "createdAt": "2020-10-20T03:48:24.735Z",
  "title": "Super chat",
  "userId": "a17413f820d48",
  "participants": [
    "a17413f820d48"
  ],
  "isPrivate": false,
  "isDialogue":  false
}
```
##### POST /chat
Create a new chat. Send:
```json
{
  "title": "Chat title"
}
```

Or:
```json
{
  "title": "Chat title",
  "participants": ["userId1", "userId2"]
}
```
Receive:
```Chat```

##### POST /chat
Create a new dialogue with specific user. Send:
```json
{
  "isDialogue": true,
  "participants": ["a17413f820d48"]
}
```
Receive:
```Chat```

##### GET /chat/id
Receive:
```Chat```

##### GET /chat/?title=
Search by chat title. Private chats and dialogues will not be found. Receive:
```[ Chat, Chat, ... ]```

##### GET /chat/?userId=
Get chats owned by user. Receive:
```[ Chat, Chat, ... ]```

##### GET /chat/?participantId=
Get chats user involved in. Receive:
```[ Chat, Chat, ... ]```

##### PUT /chat/id
*  Owner

Edit chat properties. Send: ```Chat```

* Other user

Join chat.

##### DELETE /chat/id
Delete a chat by ID if owner. Exit chat if participant.

### /message
Entity:

```json
{
  "id": "5204cc9d39cfc",
  "createdAt": "2020-10-20T03:48:24.741Z",
  "content": "Here I write my message",
  "userId": "a17413f820d48",
  "chatId": "853d59e4a2b8e",
  "type": "text"
}
```

##### POST /message
Create a new message. Send:
```json
{
  "content": "Here is my message",
  "chatId": "aa5eaed04c03d",
  "type": "text"
}
```
Receive: ```Message```

##### GET /message/?chatId=
Get all messages of given chat.
Receive: ```[ Message, Message, .. ]```

##### DELETE /message/id
Delete a message by ID.

## Websocket API reference
Connect to ws://hostname/message/chatId
### Receiving messages
* Listen to 'message' event
* Will receive ```Message``` objects

### Sending message
* Emit 'send' event with ```Message``` data

## TODO:
* ~~Use https://github.com/ai/nanoid instead of self written function~~
* User:
  * Update user profile
  * Delete user profile
  * Add to friend list
* Chat:
  * ~~Implement dialogue mode~~
  * ~~Start dialogue~~
  * ~~Private chats should not be found~~
* Message: 
  * ~~Upload message with image~~
  * Delete message
  * Edit message
  * ~~Get new messages via web socket~~
