// status.js
// Noah Sandman <noah@modulytic.com>

// parse and create new status messages
// statuses are used to update about the success or failure of operation

/* command message format:
{
    "name": "&stat",
    "params": {
        "code": str,
        "data": str     // could be error messages, etc.
    }
} 
*/

const STATUS_SIGNIFIER = "&stat";

// parse command from string
export const StatusCode = {
    OK: "OK",
    ERROR: "ERROR",
    parse: function(msg) {
        return this[msg.toUpperCase()];
    }
};

export const StatusMsg = {
    create: function(stat, data=null) {
        return {
            "name": STATUS_SIGNIFIER,
            "params": {
                "code": stat,
                "data": data
            }
        };
    },

    parse: function(msg) {
        if (typeof msg === 'string' || msg instanceof String)
            msg = JSON.parse(msg);

        if (msg["name"] != STATUS_SIGNIFIER)
            return null;

        return StatusCode.parse(msg["params"]["code"]);
    },

    getData: function(msg) {
        if (typeof msg === 'string' || msg instanceof String)
            msg = JSON.parse(msg);

        return msg["params"]["data"];
    }
}