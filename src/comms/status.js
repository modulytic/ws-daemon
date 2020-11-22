// status.js
// Noah Sandman <noah@modulytic.com>

// parse and create new status messages
// statuses are used to update about the success or failure of operation

/* command message format:
{
    "name": "+stat",
    "params": {
        "code": int
    }
} 
*/

export const StatusMsg = {
    create: function(stat) {
        return {
            "name": "+stat",
            "params": {
                "code": stat
            }
        };
    }
}