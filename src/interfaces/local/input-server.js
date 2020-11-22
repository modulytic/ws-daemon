// input-server.js
// Noah Sandman <noah@modulytic.com>

// Server to receive messages from local processes

import fs from "fs";
import net from "net";

import msgLocal from "./msg-local.js";
import fsops from "../../include/fs-ops.js";
import logging from "../../include/logging.js";

const TAG = "LocalServer";

export class InputServer {
    constructor(connector) {
        let socket = fsops.getPrefixFile("ws-daemon.sock");

        for (let i = 0; fs.existsSync(socket); i++) {
            socket = fsops.getPrefixFile(`ws-daemon${i}.sock`);
        }

        logging.stdout(`Listening at ${socket}`, TAG);

        // Create our Unix socket
        let inputServer = this;
        this.UDS_CONNECTIONS = {};
        this.server = net.createServer(function(stream) {
            logging.stdout("Received connection.", TAG);

            // Store all connections so we can terminate them if the server closes.
            // An object is better than an array for these.
            var self = Date.now();
            inputServer.UDS_CONNECTIONS[self] = (stream);
            stream.on("end", function () {
                logging.stdout("Client disconnected.", TAG);
                delete inputServer.UDS_CONNECTIONS[self];
            });

            // Messages are buffers
            stream.on("data", function(msg) {
                msgLocal(msg, connector);
            });
        })
        .listen(socket)
        .on("connection", function(socket) {
            connector.setStream(socket);
        });
    }

    cleanup() {
        this.server.close();

        // disconnect all of our clients
        if (Object.keys(this.UDS_CONNECTIONS).length) {
            let clients = Object.keys(this.UDS_CONNECTIONS);
            while (clients.length) {
                let client = clients.pop();
                this.UDS_CONNECTIONS[client].end();
            }
        }
    }
};