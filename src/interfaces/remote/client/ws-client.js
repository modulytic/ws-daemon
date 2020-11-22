// ws-client.js
// Noah Sandman <noah@modulytic.com>, Vidur Gupta <vidur@modulytic.com>

// connector for WebSockets in client mode

import ws from "ws";
import ReconnectingWebSocket from "reconnecting-websocket";

import msgRemote from "../msg-remote.js";
import { CmdMsg, CmdCode } from "../../../comms/command.js";

import logging from "../../../include/logging.js";

const TAG = "WsConnector";

export class WsClientConnector {
    constructor(url, port, secure=false) {
        // generate Websockets URL
        const wsUrl = `${(secure)?"wss":"ws"}://${url}:${port}`;
        
        let wsClient = this;

        this.rws = new ReconnectingWebSocket(wsUrl, [], {
            WebSocket: ws
        });

        this.rws.addEventListener("close", function() {
            logging.stdout("Disconnected from server.", TAG);
        });

        this.rws.addEventListener("open", function() {
            logging.stdout("Connected to server.", TAG);
        });

        this.rws.addEventListener("message", function(msg) {
            msgRemote(msg.data, wsClient);
        });
    }

    forward(msg) {
        this.rws.send(msg);
    }

    // pause for a cetain amount of time (ms)
    pause(time) {
        // We need to pause the dongle and invoke it after a set amount of time
        this.rws.close();

        // schedule reconnecting
        setTimeout(() => {
            this.rws.reconnect();
        }, time);
    }

    // handle commands
    handleCmd(cmdMsg) {
        const cmd  = CmdMsg.parse(cmdMsg);
        const data = CmdMsg.getData(cmdMsg);

        logging.stdout(`Executing ${cmd}`, TAG);

        switch (cmd) {
            case CmdCode.PAUSE: {
                this.pause(data);
                break;
            }

            default: break;
        }
    }

    cleanup() {}
}