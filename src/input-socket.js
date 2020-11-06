// input-socket.js
// Noah Sandman <noah@modulytic.com>

// Mostly based off this:
// https://gist.github.com/Xaekai/e1f711cb0ad865deafc11185641c632a

import net from "net";
import logging from "./logging.js";
import constants from "./constants.js";

let UDS_CONNECTIONS = {};
let server = null;

// active Unix socket connections
const TAG="UDS";
export default {
    create: function(ws=null, fwd=null) {
        const socket = constants.getPrefixFile("ws-daemon2.sock");

        logging.stdout(`Listening at ${socket}`, TAG);
        server = net.createServer(function(stream) {
            logging.stdout("Received connection.", TAG);

            // Store all connections so we can terminate them if the server closes.
            // An object is better than an array for these.
            var self = Date.now();
            UDS_CONNECTIONS[self] = (stream);
            stream.on("end", function() {
                logging.stdout("Client disconnected.", TAG);
                delete UDS_CONNECTIONS[self];
            });

            // Messages are buffers
            stream.on("data", function(msg) {
                const msg_str = msg.toString();
                logging.stdout(`Forwarding message: ${msg_str}`, TAG);

                if (fwd) {
                    fwd(msg_str);
                } else if (ws) {
                    ws.send(msg_str);
                }
            });
        }).listen(socket);
    },

    cleanup: function() {
        server.close();

        if (Object.keys(UDS_CONNECTIONS).length) {
            let clients = Object.keys(UDS_CONNECTIONS);
            while (clients.length) {
                let client = clients.pop();
                UDS_CONNECTIONS[client].end(); 
            }
        }
    }
};