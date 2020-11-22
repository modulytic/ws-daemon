// ws-connection.js
// Noah Sandman <noah@modulytic.com>

// Object to interface with each individual WS server connection

import msgRemote from "../msg-remote.js";

export class WsConnection {
    constructor(ws, server) {
        this.ws = ws;
        this.server = server;
    }

    // send message to connection
    send(msg) {
        this.ws.send(msg);
    }

    prepare() {
        let wsConnection = this;

        this.ws.isAlive = true;
        this.ws.on("pong", function() {
            wsConnection.ws.isAlive = true;
        });

        // endpoint disconnected, remove from active connections
        this.ws.on("close", function() {
            wsConnection.close();
        });

        // on message decode JSON and run file from scripts folder
        this.ws.on("message", function(msg) {
            msgRemote(msg, wsConnection.server);
        });
    }

    close() {
        if (this.server)
            this.server.close(this);
    }
};