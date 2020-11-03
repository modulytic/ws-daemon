// Mostly based off this:
// https://gist.github.com/Xaekai/e1f711cb0ad865deafc11185641c632a

const net = require("net");
const constants = require("./constants.js");
const logging = require("./logging.js");

let UDS_CONNECTIONS = {};
let server = null;

// active Unix socket connections
const TAG="UDS";
let isock = {
    create: function(ws=null, fwd=null) {
        socket = constants.getPrefixFile("ws-daemon.sock");

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