const fs = require("fs");
const getenv = require("getenv");

module.exports = {
    getPrefix: function() {
        return getenv.string("WSDAEMON_PREFIX", "/root/ws-daemon");
    },
    getPrefixFile: function(file, subdir="") {
        if (subdir != "")
            subdir = "/" + subdir
        return this.getPrefix() + subdir + "/" + file;
    },

    createWsUrl: function(url, port=80, secure=false) {
        const prefix = (secure) ? "wss" : "ws";
        return prefix + "://" + url + ":" + port;
    },

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