// input-socket.js
// Noah Sandman <noah@modulytic.com>

// Mostly based off this:
// https://gist.github.com/Xaekai/e1f711cb0ad865deafc11185641c632a

import net from "net";
import logging from "./logging.js";
import constants from "./constants.js";
import fs from "fs";

let UDS_CONNECTIONS = {};
let server = null;

// active Unix socket connections
const TAG="UDS";
export default {
    create: function(ws=null, fwd=null) {
        const socket = constants.getPrefixFile("ws-daemon.sock");

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

		const msg_json = JSON.parse(msg_str);
		if (msg_json["name"] = "pause_dongle") {
		    // We need to pause the dongle and invoke it after a set amount of time
                    ws.close();

		    var devices_info = JSON.parse(fs.readFileSync('/root/ws-daemon/scripts/curr_device.json', 'utf8'));
		    // Reset limits
		    if (msg_json["params"]["pause_time"] == (60 * 60 * 24 * 1000)) {
			    devices_info["daily_msg"] = [];
		    }
		    devices_info["hourly_msg"] = [];
		    fs.writeFileSync('/root/ws-daemon/scripts/curr_device.json', JSON.stringify(devices_info));

		    setTimeout(() => {
			ws.reconnect();
		    }, msg_json["params"]["pause_time"]);
		} else if (fwd) {
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
