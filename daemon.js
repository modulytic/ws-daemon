const WebSocket = require("ws");

const constants = require("./constants.js");
let InputSocket = require("./input-socket.js").isock;
let WsManager = require("./ws-manager.js").wsm;

const configVars = constants.getConfig();

let localServer;
switch (configVars["mode"]) {
    case "server": {
        console.log("hello, i am your server");

        WsManager.makeServer();
        localServer = InputSocket.create(null, fwd=WsManager.rrSendNext);

        const wss = new WebSocket.Server({ port: configVars["port"] });
        wss.on("connection", WsManager.prepare);

        break;
    }

    case "client": {
        console.log("hello, i am a small client");

        let ws = new WebSocket(constants.createWsUrl(configVars["proxy"], configVars["port"]));
        WsManager.prepare(ws);

        localServer = InputSocket.create(ws=ws);

        break;
    }

    default: {
        console.log("Unknown mode", configVars["mode"]);
        break;
    }
}

// Open socket server
process.on("SIGINT", function() {
    console.log("Received SIGINT, terminating!!!");

    InputSocket.cleanup();
    WsManager.cleanup();
    
    process.exit(0);
});