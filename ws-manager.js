const constants = require("./constants.js");
const spawn = require("child_process").spawn;

function execScript(filename, params) {
    const scriptName = constants.getPrefixFile(filename, "scripts");
    let paramsStr    = JSON.stringify(params);

    console.log("Spawning process", scriptName);
    spawn(scriptName, [paramsStr]);
}

let isServer = false;
// active WebSocket connections (for server)
ACTIVE_CONNECTIONS = []; 

// next endpoint to be forwarded to, for round robin system
let RR_NEXT_ENDPOINT = 0;

let wsm = {
    makeServer: function() {
        isServer = true;
    },

    prepare: function(ws) {
        // keep track of all active connections to a server
        if (isServer) {
            const numConnections = ACTIVE_CONNECTIONS.push(ws);
            console.log("Websockets: Endpoint " + (numConnections-1) + " connected.");

            // endpoint disconnected, remove from active connections
            ws.on("close", function close() {
                const indexInAC = ACTIVE_CONNECTIONS.indexOf(ws);
                console.log("Websockets: Endpoint " + indexInAC + " disconnected");
                if (indexInAC > -1)
                    ACTIVE_CONNECTIONS.splice(indexInAC, 1)
            });
        }

        ws.on("message", function incoming(message) {
            // decode JSON and run file from scripts folder
            const msgOps = JSON.parse(message);
            execScript(msgOps["name"], msgOps["params"]);
        });
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
            c.terminate();
        });
    }
};

module.exports = { wsm };
