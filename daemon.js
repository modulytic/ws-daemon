const WebSocket = require("ws");

const constants = require("./constants.js");
const logging = require("./logging.js");
let InputSocket = require("./input-socket.js").isock;
let WsManager = require("./ws-manager.js").wsm;

const configVars = constants.getConfig();

let localServer;
switch (configVars["mode"]) {
    case "server": {
        logging.stdout("hello, i am your server");

        WsManager.makeServer();
        localServer = InputSocket.create(null, fwd=WsManager.rrSendNext);

        const wss = new WebSocket.Server({ port: configVars["port"] });
        wss.on("connection", WsManager.prepare);

        logging.stdout(`Listening on 127.0.0.1:${configVars["port"]}`, "WS");

        break;
    }

    case "client": {
        logging.stdout("hello, i am a small client");

        let ws = new WebSocket(constants.createWsUrl(configVars["proxy"], configVars["port"]));
        WsManager.prepare(ws);

        localServer = InputSocket.create(ws=ws);

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