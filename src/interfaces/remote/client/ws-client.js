// ws-client.js
// Noah Sandman <noah@modulytic.com>, Vidur Gupta <vidur@modulytic.com>

// connector for WebSockets in client mode

import ws from "ws";
import fs from "fs";
import ReconnectingWebSocket from "reconnecting-websocket";

import { Connector } from "../connector.js";

import msgRemote from "../msg-remote.js";
import { CmdMsg, CmdCode } from "../../../comms/command.js";

import logging from "../../../include/logging.js";
import fsops from "../../../include/fs-ops.js";

const TAG = "WsConnector";

export class WsClientConnector extends Connector {
    constructor(url, port, secure=false) {
        super();

        // generate Websockets URL
        const wsUrl = `${(secure)?"wss":"ws"}://${url}:${port}`;

        this.rws = new ReconnectingWebSocket(wsUrl, [], {
            WebSocket: ws
        });

        this.rws.addEventListener("close", () => {
            logging.stdout("Disconnected from server.", TAG);
        });

        this.rws.addEventListener("open", () => {
            logging.stdout("Connected to server.", TAG);
        });

        this.rws.addEventListener("message", (msg) => {
            msgRemote(msg.data, this);
        });
    }

    forward(msg) {
        this.rws.send(msg);
    }

    // pause for a cetain amount of time (ms)
    pause(time) {
        // We need to pause the dongle and invoke it after a set amount of time
        this.rws.close();

        // Get endpoint dongle sending status
        const file = fsops.getPrefixFile("curr_device.json", "data");
        let devices_info = JSON.parse(fs.readFileSync(file, "utf8"));

        // Reset limits
        if (msg_json["params"]["pause_time"] == (60 * 60 * 24 * 1000)) {
            devices_info["daily_msg"] = [];
        }
        devices_info["hourly_msg"] = [];
        fs.writeFileSync(file, JSON.stringify(devices_info));

        // schedule reconnecting
        setTimeout(() => {
            this.rws.reconnect();
        }, time);
    }

    // handle commands
    customCmd(cmd, data) {
        switch (cmd) {
            case CmdCode.PAUSE: {
                this.pause(data);
                break;
            }

            default: break;
        }
    }

    cleanup() {
        this.rws.close();
    }
}
