// connector.js
// Noah Sandman <noah@modulytic.com>

// base class for connectors

import logging from "../../include/logging.js";

import { StatusMsg } from "../../comms/status.js";
import { CmdMsg, CmdCode } from "../../comms/command.js";

export class Connector {
    constructor() {
        this.stream = null;
        this.TAG = this.constructor.name;
    }

    setStream(stream) {
        logging.stdout("Giving connector access to local Socket", this.TAG);
        this.stream = stream;
    }

//  customCmd(cmd, data) {}

    handleCmd(msg) {
        const cmd  = CmdMsg.parse(msg);
        const data = CmdMsg.getData(msg);

        logging.stdout(`Handling command ${cmd}`, this.TAG);

        switch (cmd) {
            // when receiving a status command, print the status response to command line
            case CmdCode.STATUS: {
                if (this.stream) {
                    const res = StatusMsg.create(data);
                    const resStr = JSON.stringify(res);

                    this.stream.write(`${resStr}\n`);
                } else {
                    logging.stdout("No client connected, skipping status", this.TAG);
                }

                break;
            }

            // let subclasses implement custom commands
            default: this.customCmd(cmd, data);
        }
    }
}
