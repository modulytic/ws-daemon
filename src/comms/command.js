// command.js
// Noah Sandman <noah@modulytic.com>

// parse and create new commands
// commands are messages that do not run a script, but instruct
// the recipient to do something

// commands can be local (+cmd) so your machine will run it
// or they can be remote (&cmd) so the other machine will run it

/* command message format:
{
    "name": "&cmd",
    "params": {
        "code": str,
        "data": <>
    }
} 
*/

// parse command from string
export const CmdCode = {
    PAUSE: "PAUSE",
    parse: function(msg) {
        return this[msg.toUpperCase()];
    }
};

const SIGNIFIER_REMOTE = "&cmd";
const SIGNIFIER_LOCAL  = "+cmd";

export const CmdMsg = {
    SIGNIFIER_REMOTE: SIGNIFIER_REMOTE,
    SIGNIFIER_LOCAL: SIGNIFIER_LOCAL,
    SIGNIFIERS: [
        SIGNIFIER_REMOTE,
        SIGNIFIER_LOCAL
    ],

    create: function(cmd) {
        return {
            "name": CmdMsg.SIGNIFIER,
            "params": {
                "code": cmd
            }
        };
    },

    parse: function(msg) {
        if (typeof msg === 'string' || msg instanceof String)
            msg = JSON.parse(msg);

        if (!CmdMsg.SIGNIFIERS.includes(msg["name"]))
            return null;

        return CmdCode.parse(msg["params"]["code"]);
    },

    getData: function(msg) {
        if (typeof msg === 'string' || msg instanceof String)
            msg = JSON.parse(msg);

        return msg["params"]["data"];
    }
}
