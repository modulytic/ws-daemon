// config.js
// Noah Sandman <noah@modulytic.com>

// possible modes that the app can run in

export const ExecModes = {
    SERVER: "server",
    CLIENT: "client",
    parse: function(mode) {
        const fullKey = mode.toUpperCase();
        return this[fullKey];
    }
};
