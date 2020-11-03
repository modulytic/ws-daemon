const constants = require("./constants.js");
const spawn = require("child_process").spawn;
const logging = require("./logging.js");

function execScript(filename, params) {
    const scriptName = constants.getPrefixFile(filename, "scripts");
    let paramsStr    = JSON.stringify(params);

    logging.stdout(`Starting ${scriptName}`);
    
    const childProcess = spawn(scriptName, [paramsStr]);
    childProcess.stdout.on("data", (data) => {
        logging.stdout(`stdout: ${data}`, tag=filename);
    });

    childProcess.stderr.on("data", (data) => {
        logging.stderr(`stderr: ${data}`, tag=filename);
    });

    childProcess.on("close", (code) => {
        logging.stdout(`exited with code ${code}`, tag=filename);
    });
}

let isServer = false;
// active WebSocket connections (for server)
ACTIVE_CONNECTIONS = []; 

// next endpoint to be forwarded to, for round robin system
let RR_NEXT_ENDPOINT = 0;

const TAG = "WS";
let wsm = {
    makeServer: function() {
        isServer = true;
    },

    prepare: function(ws) {
        // keep track of all active connections to a server
        if (isServer) {
            const numConnections = ACTIVE_CONNECTIONS.push(ws);
            logging.stdout(`Endpoint ${numConnections-1} connected.`, TAG);

            // endpoint disconnected, remove from active connections
            ws.on("close", function close() {
                const indexInAC = ACTIVE_CONNECTIONS.indexOf(ws);
                logging.stdout(`Endpoint ${indexInAC} disconnected`, TAG);
                if (indexInAC > -1)
                    ACTIVE_CONNECTIONS.splice(indexInAC, 1)

                // check if we made our round-robin index wrong
                if (RR_NEXT_ENDPOINT >= ACTIVE_CONNECTIONS.length)
                    RR_NEXT_ENDPOINT = 0;
            });
        }

        // decode JSON and run file from scripts folder
        ws.on("message", function incoming(message) {
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
