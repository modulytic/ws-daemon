// connector.js
// Noah Sandman <noah@modulytic.com>

// base class for connectors

import logging from "../../include/logging.js";

export class Connector {
    constructor() {
        this.stream = null;
    }

    setStream(stream) {
        logging.stdout("Giving connector access to local Socket", this.constructor.name);
        this.stream = stream;
    }
}