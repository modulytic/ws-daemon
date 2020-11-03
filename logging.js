function stdout(msg, tag="") {
    log_custom(console.log, msg, tag);
}

function stderr(msg, tag="") {
    log_custom(console.error, msg, tag);
}

function log_custom(f, msg, tag="") {
    if (tag != "")
        tag = `${tag}: `;

    const timestamp = (new Date()).toISOString();
    f(`${timestamp}: ${tag}${msg}`);
}

module.exports = {
    stdout, stderr
};