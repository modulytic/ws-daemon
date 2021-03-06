// msg-local.js
// Noah Sandman <noah@modulytic.com>

// deal with local messages, AKA ones received by the input server

import logging from "../../include/logging.js";

import { CmdCode, CmdMsg } from "../../comms/command.js";

const TAG = "MsgLocal";

export default function(msg, connector) {
    const msg_str = msg.toString();
    logging.stdout(`Handling message received from InputServer: ${msg_str}`, TAG);

    try {
        const msg_json = JSON.parse(msg_str);
        switch (msg_json["name"]) {
            case CmdMsg.SIGNIFIER_LOCAL: {
                logging.stdout("Treating message as local command", TAG);
                connector.handleCmd(msg_json);
                break;
            }

            default: {
                const success = connector.forward(msg_str);

                // this will fire if there are no clients connected to the server
                //  or just generally if there was an error forwarding
                if (!success) {
                    const failureMsg = CmdMsg.createLocal(CmdCode.STATUS, {
                        "status": -2,
                        "id": msg_json["id"]
                    });
                    connector.handleCmd(failureMsg);
                }
            }
        }
    } catch (e) {
        if (e instanceof SyntaxError) {
            logging.stderr("Received InputServer message could not be parsed", TAG);
        } else {
            logging.stderr(e);
        }
    }
};
