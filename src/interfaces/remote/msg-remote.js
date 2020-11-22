// msg-remote.js
// Noah Sandman <noah@modulytic.com>

// deal with local messages, AKA ones received by the websockets server

import logging from "../../include/logging.js";

import { CmdMsg } from "../../comms/command.js";
import { StatusMsg } from "../../comms/status.js";
import { execScript } from "../../service/exec-script.js";

const TAG = "MsgRemote";

export default function(msg, connector) {
    const msg_str = msg.toString();
    logging.stdout(`Handling message received from WebSockets: ${msg_str}`, TAG);

    try {
        const msg_json = JSON.parse(msg_str);

        switch (msg_json["name"]) {
            case CmdMsg.SIGNIFIER_REMOTE: {
                logging.stdout("Treating message as received remote command, executing", TAG);
                connector.handleCmd(msg_json);
                break;
            }
    
            default: {
                execScript(msg_json["name"], msg_json["params"], function(code) {
                    const res = StatusMsg.create(code);
                    const resStr = JSON.stringify(res);
    
                    connector.stream.write(`${resStr}\n`);
                });
                break;
            }
        }
    } catch (e) {
        if (e instanceof SyntaxError) {
            logging.stderr("Received WebSockets message could not be parsed", TAG);
        } else {
            logging.stderr(e);
        }
    }
}