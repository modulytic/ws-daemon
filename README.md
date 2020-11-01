# ws-daemon

This is a daemon that facilitates an easy, two-way, persistent, JSON-based, communication channel between processes on different machines, in different languages, on different system. It communicates with local processes through a Unix socket, and remote processes through WebSockets. Remote processes can trigger scripts on your local system with custom params (received through WebSockets), and you can do the same for them (written to the local socket).

If the daemon is in server mode and it has multiple connections, it will message them each sequentially in a round-robin fashion.

## How it Works

### Modes

There are two modes this software can run in: client and server. Client will act as a websockets client, and server will be a websockets server. Other than that, they work practically identically. However, due to WebSockets's nature, they require slightly different configuration.

### Prefix

First, ws-daemon needs to know where to look for its files. This defaults to `/root/ws-daemon`, but you can change the prefix by setting the environment variable `WSDAEMON_PREFIX`.

### Configuration

In your prefix folder, create a file called config.json. If it is a client, it should look like this:

```json
{
    "mode": "client",
    "proxy": "<server URL>",
    "port": 3006
}
```

If it is a server, it is similar: 
```json
{
    "mode": "server",
    "port": 3006
}
```

### Socket

The socket is located in the prefix, and is called `ws-daemon.sock`. It can be connected to externally and written to, but the daemon will not send any data back through this socket.

### Scripts

Scripts are located in the `scripts/` subdirectory of the prefix.

### Messaging

If this daemon receives a message, it will decode it as JSON. It expects this structure:

```json
{
    "name": "<script name>",
    "params": {
        "param1": "val1"
    }
}
```

The parameter `name` should be the name of a file in `scripts/` with execute permissions. The params will be stringified and passed otherwise unmodified to that script as an argument.

## Running

Once your environment is configured, just run `npm start` to start the server.
