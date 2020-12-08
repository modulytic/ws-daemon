// fsops.js
// Noah Sandman <noah@modulytic.com>

// Filesystem operations

import fs from "fs";
import getenv from "getenv";

export default {
    // get prefix for ws-daemon
    getPrefix: function() {
        return getenv.string("WSDAEMON_PREFIX", "/root/ws-daemon");
    },

    // get file in root or subdir of prefix folder
    getPrefixFile: function(file, subdir="") {
        if (subdir != "")
            subdir = "/" + subdir
        return this.getPrefix() + subdir + "/" + file;
    },

    // read configuration from prefix folder
    config: null,
    getConfig: function() {
        if (this.config)
            return this.config;

        const configFile = this.getPrefixFile("config.json");
        let rawdata = fs.readFileSync(configFile);

        this.config = JSON.parse(rawdata);
        return this.getConfig();
    }
}
