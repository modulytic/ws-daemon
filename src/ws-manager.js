// ws-manager.js
// Noah Sandman <noah@modulytic.com>

import logging from "./logging.js";
import constants from "./constants.js";

import fs from "fs";
import { spawn } from "child_process";

function execScript(filename, params) {
    const scriptPath = constants.getPrefixFile(filename, "scripts");
    let paramsStr    = JSON.stringify(params);

    try {
        if (fs.existsSync(scriptPath)) {
            logging.stdout(`Starting ${scriptPath}`);
    
            const childProcess = spawn(scriptPath, [paramsStr]);
            childProcess.stdout.on("data", (data) => {
                logging.stdout(`stdout: ${data}`, filename);
            });

            childProcess.stderr.on("data", (data) => {
                logging.stderr(`stderr: ${data}`, filename);
            });

            childProcess.on("close", (code) => {
                logging.stdout(`exited with code ${code}`, filename);
            });
        }
    } catch(err) {
        logging.stderr(err);
    }
}

// active WebSocket connections (for server)
let ACTIVE_CONNECTIONS = []; 

// next endpoint to be forwarded to, for round robin system
let RR_NEXT_ENDPOINT = 0;

function disconnect(ws) {
    ws.send("bye");
    return ws.terminate();
}

const wsFunctions = {
    incoming: function(message) {
        try {
            const msgOps = JSON.parse(message);
            execScript(msgOps["name"], msgOps["params"]);
        } catch (e) {
            logging.stderr(`Error handling received message: "${message}"\n\t${e}`, TAG);
        }
    },

    close: function(ws) {
        const indexInAC = ACTIVE_CONNECTIONS.indexOf(ws);
        logging.stdout(`Endpoint ${indexInAC} disconnected`, TAG);
        if (indexInAC > -1)
            ACTIVE_CONNECTIONS.splice(indexInAC, 1)

        // check if we made our round-robin index wrong
        if (RR_NEXT_ENDPOINT >= ACTIVE_CONNECTIONS.length)
            RR_NEXT_ENDPOINT = 0;
    },

    heartbeat: function(ws) {
        ws.isAlive = true;
    }
}

const TAG = "WS";
export default {
    wsFunctions: wsFunctions,
    disconnect: disconnect,
    prepareServer: function(ws) {
        ws.isAlive = true;
        ws.on("pong", function() {
            wsFunctions.heartbeat(ws);
        });

        // keep track of all active connections to a server
        const numConnections = ACTIVE_CONNECTIONS.push(ws);
        logging.stdout(`Endpoint ${numConnections-1} connected.`, TAG);

        // endpoint disconnected, remove from active connections
        ws.on("close", function() {
            wsFunctions.close(ws);
        });

        // on message decode JSON and run file from scripts folder
        ws.on("message", wsFunctions.incoming);
    },

    rrSendNext: function(msg) {
        let ws = ACTIVE_CONNECTIONS[RR_NEXT_ENDPOINT++];

        if (RR_NEXT_ENDPOINT >= ACTIVE_CONNECTIONS.length)
            RR_NEXT_ENDPOINT = 0;

        if (ws)
            ws.send(msg);
    },

    cleanup: function() {
        ACTIVE_CONNECTIONS.forEach(function(c) {
            disconnect(c);
        });
    }
};
