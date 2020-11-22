// app.js
// Noah Sandman <noah@modulytic.com>

// ws-daemon app interface

import fsops from "./include/fs-ops.js";
import logging from "./include/logging.js";
import { ExecModes } from "./include/config.js";

import { InputServer } from "./interfaces/local/input-server.js";
import { WsClientConnector } from "./interfaces/remote/client/ws-client.js";
import { WsServerConnector } from "./interfaces/remote/server/ws-server.js";

// get all of our parameters from our config file
const configVars = fsops.getConfig();
logging.stdout(`Attempting to start with mode '${configVars["mode"]}'`);
const execMode = ExecModes.parse(configVars["mode"]);

// start the client or server based on the mode selected
let ws = null;
if (execMode == ExecModes.CLIENT) {
    ws = new WsClientConnector(configVars["proxy"], configVars["port"]);
} else if (execMode == ExecModes.SERVER) {
    ws = new WsServerConnector(configVars["port"]);
}

// open our local communication socket
const inputServer = new InputServer(ws);

// cleanup when the process has to close
process.on("SIGINT", function() {
    logging.stdout("Received SIGINT, terminating!!!");

    inputServer.cleanup();
    ws.cleanup();
    
    process.exit(0);
});
