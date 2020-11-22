// logging.js
// Noah Sandman <noah@modulytic.com>

// logging

export function stdout(msg, tag="") {
    log_custom(console.log, msg, tag);
}

export function stderr(msg, tag="") {
    log_custom(console.error, msg, tag);
}

export function debug_obj(obj) {
    console.dir(obj);
}

function log_custom(f, msg, tag="") {
    if (tag != "")
        tag = `${tag}: `;

    const timestamp = (new Date()).toLocaleString();
    f(`${timestamp}: ${tag}${msg}`);
}

export default {
    stdout, stderr, debug_obj
};
