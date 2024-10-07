# WebSocket API Documentation for Pong Game Server

## Overview
This WebSocket server allows clients (players) to create, join, and play Pong games. Players can move paddles, send messages, and receive game state updates. The server handles different types of actions, such as creating a game, joining a game, moving the paddle, and sending messages.

## WebSocket Connection
- Endpoint: ws://<server-address>:8080
- Protocol: The server listens for WebSocket connections on port 8080.
- Upon Connection: A unique clientID is generated for each client and sent back to the client in the form of a JSON payload with the "action":"connect".

## WebSocket Message Structure

All messages exchanged between the client and the server are in JSON format. Each message includes:

- action (string): Specifies the action to be taken (e.g., create, join, move).
- clientID (string): The unique ID of the client sending the message.
- Additional fields specific to the action type.

## Actions

The server processes various actions. Here's a detailed breakdown of each one:

### 1. Connect
- Triggered By: Server
- Description: Automatically triggered when a client successfully establishes a WebSocket connection. It generates and sends a clientID to the client.
- Payload from Server:
```
{
    "action": "connect",
    "clientID": "unique-client-id"
}
```
- Purpose: Notifies the client of their unique clientID.
### 2. Create Game

- Triggered By: Client
- Description: Creates a new game and registers it on the server.
- Payload from Client:
```
{
    "action": "create",
    "clientID": "unique-client-id"
}
```
- Response Payload from Server:
```
{
    "action": "create",
    "game": {
        "id": "unique-game-id",
        "clients": []
    }
}
```
- Purpose: Initializes a new game room on the server and assigns a unique gameID.

### 3. Join Game
- Triggered By: Client
- Description: Allows a client to join an existing game.
- Payload from Client:
```
{
    "action": "join",
    "clientID": "unique-client-id",
    "gameID": "unique-game-id"
}
```
- Response Payload from Server:
```
{
    "action": "join",
    "game": {
        "id": "unique-game-id",
        "clients": [
            {
                "clientID": "client-id-1",
                "paddle": "Left"
            },
            {
                "clientID": "client-id-2",
                "paddle": "Right"
            }
        ]
    }
}
```

- Purpose: Adds the client to the specified game room. The server also assigns a paddle (Left or Right) to the client and broadcasts the updated game state to all clients in the room.

### 4. Move Paddle
- Triggered By: Client
- Description: Allows the client to move their paddle up or down.
- Payload from Client:
```
{
    "action": "move",
    "clientID": "unique-client-id",
    "gameID": "unique-game-id",
    "direction": "up"  // or "down"
}
```
Response Payload from Server:
```
{
    "action": "update",
    "game": {
        "id": "unique-game-id",
        "clients": [
            {
                "clientID": "client-id-1",
                "paddle": "Left"
            },
            {
                "clientID": "client-id-2",
                "paddle": "Right"
            }
        ],
        "state": {
            "client-id-1": { "position": -1 },
            "client-id-2": { "position": 3 }
        }
    }
}
```
- Purpose: Updates the game state with the client's paddle position based on the direction (up or down). The server then broadcasts the new game state to all clients in the room.
### 5. Send Message
- Triggered By: Client
- Description: Sends a chat message to other players in the game.
- Payload from Client:
```
{
    "action": "sendmessage",
    "clientID": "unique-client-id",
    "gameID": "unique-game-id",
    "content": "Hello, everyone!"
}
```
- Response Payload from Server (Broadcast to all clients in the game):
```
{
    "action": "message",
    "from": "unique-client-id",
    "content": "Hello, everyone!"
}
```
- Purpose: Allows clients to communicate with each other within the game room.

### 6. Get Messages
- Triggered By: Client
Description: Fetches the message history of the current game.
- Payload from Client:
```
{
    "action": "getmessages",
    "clientID": "unique-client-id",
    "gameID": "unique-game-id"
}
```
- Response Payload from Server:
```
{
    "action": "getmessages",
    "from": "unique-client-id",
    "messages": [
        {
            "action": "message",
            "from": "client-id-1",
            "content": "Hello!"
        },
        {
            "action": "message",
            "from": "client-id-2",
            "content": "Hi there!"
        }
    ]
}
```
- Purpose: Retrieves and sends the chat history of the specified game to the client.

### 7. Play Game (Legacy)
- Triggered By: Client
- Description: This action appears to update the game state based on the client's side. (Usage of this action is less clear based on the current code.)
- Payload from Client:
```
{
    "action": "play",
    "clientID": "unique-client-id",
    "gameID": "unique-game-id",
    "paddleID": "client-id",
    "side": "Left"
}
```
- Purpose: Updates the game state with the client's paddle side. This action might be legacy or related to more specific game mechanics.


## Error Handling
If an error occurs (invalid action, missing data, etc.), the server responds with an error message:

```
{
    "action": "error",
    "message": "Descriptive error message"
}
```

## Notes
- Client State: The server maintains a list of clients using a Map, keyed by clientID, which stores each client's WebSocket connection.
G- ame State: Games are stored in a Map keyed by gameID. Each game keeps track of its clients and the current state (paddle positions, message history, etc.).
- Periodic Updates: The server periodically broadcasts the game state to all clients in each game room to ensure synchronization (updateGameState function).

## Example Usage Workflow
1. Connect: Client connects to the WebSocket server and receives a clientID.
2. Create Game: Client sends a "create" action to create a new game room.
3. Join Game: Another client sends a "join" action to join the game using the gameID.
4. Move Paddle: Clients send "move" actions to move their paddles.
5. Messaging: Clients can use "sendmessage" to communicate with each other.
6. Periodic Updates: The server periodically sends "update" messages to sync game state.

This WebSocket API allows for the basic operations needed for a two-player Pong game, handling player movements, game state synchronization, and in-game messaging.