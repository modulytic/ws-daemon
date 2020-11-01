// Mostly based off this:
// https://gist.github.com/Xaekai/e1f711cb0ad865deafc11185641c632a

const net = require("net");
const constants = require("./constants.js");

let UDS_CONNECTIONS = {};
let server = null;

// active Unix socket connections
let isock = {
    create: function(ws=null, fwd=null) {
        socket = constants.getPrefixFile("ws-daemon.sock");

        console.log("Input socket: Listening at", socket);
        server = net.createServer(function(stream) {
            console.log("Input socket: Received connection.");

            // Store all connections so we can terminate them if the server closes.
            // An object is better than an array for these.
            var self = Date.now();
            UDS_CONNECTIONS[self] = (stream);
            stream.on("end", function() {
                console.log("Input socket: Client disconnected.");
                delete UDS_CONNECTIONS[self];
            });

            // Messages are buffers
            stream.on("data", function(msg) {
                const msg_str = msg.toString();
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

module.exports = { isock };