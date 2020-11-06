// daemon.js
// Noah Sandman <noah@modulytic.com>

import WebSocket from "ws";
import ReconnectingWebSocket from "reconnecting-websocket";

import logging from "./logging.js";
import constants from "./constants.js";
import InputSocket from "./input-socket.js";
import WsManager from "./ws-manager.js";

const configVars = constants.getConfig();

let testAlive = null;
switch (configVars["mode"]) {
    case "server": {
        logging.stdout("hello, i am your server");

        InputSocket.create(null, WsManager.rrSendNext);

        const wss = new WebSocket.Server({ port: configVars["port"] });
        wss.on("connection", WsManager.prepareServer);

        // https://github.com/websockets/ws#how-to-detect-and-close-broken-connections
        // make sure none of our endpoints have become disconnected
        testAlive = setInterval(function ping() {
            wss.clients.forEach(function each(ws) {
                if (ws.isAlive === false)
                    return WsManager.disconnect(ws);

                ws.isAlive = false;
                ws.ping(function() {});
            });
        }, 30000);
        
        // stop periodically pinging when the server disconnects
        wss.on("close", function close() {
            clearInterval(testAlive);
        });

        logging.stdout(`Listening on port ${configVars["port"]}`, "WS");

        break;
    }

    case "client": {
        logging.stdout("hello, i am a small client");

        // reconnecting websocket in case the proxy temporarily gets disconnected
        const wsUrl = constants.createWsUrl(configVars["proxy"], configVars["port"]);
        let rws = new ReconnectingWebSocket(wsUrl, [], {
            WebSocket: WebSocket
        });
        rws.addEventListener("close", function() {
            logging.stdout("Disconnected from server.", "WS");
        });
        rws.addEventListener("open", function() {
            logging.stdout("Connected to server.", "WS");
        });
        rws.addEventListener("message", function(msg) {
            WsManager.wsFunctions.incoming(msg.data);
        });

        InputSocket.create(rws);

        break;
    }

    default: {
        logging.stderr(`Unknown mode ${configVars["mode"]}`);
        break;
    }
}

// Open socket server
process.on("SIGINT", function() {
    logging.stdout("Received SIGINT, terminating!!!");

    InputSocket.cleanup();
    WsManager.cleanup();
    
    process.exit(0);
});