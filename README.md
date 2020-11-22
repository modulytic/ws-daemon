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

The socket is located in the prefix, and is called `ws-daemon.sock`. It can be connected to externally and written to, but the daemon will not send any data back through this socket. However, status updates through it are a feature that will be implemented soon.

If `ws-daemon.sock` already exists, the daemon will try to create a different file, starting with `ws-daemon0.sock` and increasing until a file exists.

### Scripts

Scripts are located in the `scripts/` subdirectory of the prefix. **Make sure they are marked as executable, otherwise ws-daemon cannot run them!** 

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

If the message is not a command, the parameter `name` should be the name of a file in `scripts/` with execute permissions. The params will be stringified and passed otherwise unmodified to that script as an argument.

### Status

After executing a script, ws-daemon will return its status in the local socket:

```json
{
	"name": "+stat",
	"params": {
		"code": 0
	}
}
```

`code` will be set to whatever status the process exited with.

### Commands

There are certain commands built into ws-daemon. They have this structure:

```json
{
	"name": "&cmd or +cmd",
	"params": {
		"code": "COMMAND",
		"data": null
	}
}
```

`&cmd` will run the command on the remote machine, and `+cmd` will run it on the local machine. `data` can have a value, but does not have to, since not all commands require any params.

Here are the possible commands.

Executed on a client:

1. `code: "PAUSE", data: int`, **description**: suspends connection from client for `data` ms

There are currently no server commands.

## Running

Once your environment is configured, just run `npm start` to start the daemon. To run it in the background, run `npm start &`.
