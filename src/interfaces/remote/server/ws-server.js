// ws-server.js
// Noah Sandman <noah@modulytic.com>

// connector for WebSockets in server mode

import WebSocket from "ws";

import logging from "../../../include/logging.js";

import { WsConnection } from "./ws-connection.js";
import { CmdMsg, CmdCode } from "../../../comms/command.js";

const TAG = "WsServer";

export class WsServerConnector {
    constructor(port=80) {
        this.wss = new WebSocket.Server({"port": port});

        // variables needed for round-robin and connection tracking
        this.RR_NEXT_ENDPOINT = 0;
        this.ACTIVE_CONNECTIONS = [];

        let wsServer = this;

        this.wss.on("connection", function(ws) {
            // Make our server behave the right way
            wsServer.connection = new WsConnection(ws, wsServer);
            wsServer.connection.prepare();

            // add new connections to round-robin list
            const numConnections = wsServer.ACTIVE_CONNECTIONS.push(wsServer.connection);
            logging.stdout(`Endpoint ${numConnections-1} connected.`, TAG);
        });

        // https://github.com/websockets/ws#how-to-detect-and-close-broken-connections
        // make sure none of our endpoints have become disconnected
        const testAlive = setInterval(function() {
            wsServer.wss.clients.forEach(function(ws) {
                if (ws.isAlive === false)
                    return wsServer.close(ws);

                ws.isAlive = false;
                ws.ping(function() {});
            });
        }, 30000);

        this.wss.on("close", function() {
            clearInterval(testAlive);
        });

        logging.stdout(`Listening on port ${port}`, TAG);
    }

    // get next dongle in round-robin
    getEndpoint(advance=true) {
        if (advance) {
            this.RR_NEXT_ENDPOINT++;

            if (this.RR_NEXT_ENDPOINT >= this.ACTIVE_CONNECTIONS.length)
                this.RR_NEXT_ENDPOINT = 0;
        }

        return this.ACTIVE_CONNECTIONS[this.RR_NEXT_ENDPOINT];
    }

    // send message to the next dongle
    forward(msg) {
        logging.stdout("Forwarding message to connected client", TAG);
        const conn = this.getEndpoint();

        if (conn)
            conn.send(msg);
    }

    // close a specific connection
    close(ws) {
        const indexInAC = this.ACTIVE_CONNECTIONS.indexOf(ws);

        logging.stdout(`Endpoint ${indexInAC} disconnected`, TAG);

        if (indexInAC > -1)
            this.ACTIVE_CONNECTIONS.splice(indexInAC, 1);

        // check if we made our round-robin index wrong
        if (this.RR_NEXT_ENDPOINT >= this.ACTIVE_CONNECTIONS.length)
            this.RR_NEXT_ENDPOINT = 0;
    }

    // close all connections
    cleanup() {
        const wsServer = this;
        this.ACTIVE_CONNECTIONS.forEach(function(c) {
            wsServer.close(c);
        });
    }

    // handle commands
    handleCmd(cmdMsg) {
        logging.stdout("Handling command", TAG);
        const cmd  = CmdMsg.parse(cmdMsg);
        // const data = CmdMsg.getData(cmdMsg);

        switch (cmd) {
            // server cannot pause, so ignore this command
            case CmdCode.PAUSE:
                break;

            default: break;
        }
    }
}