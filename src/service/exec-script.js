// exec-script.js
// Noah Sandman <noah@modulytic.com>

// if not a command, run a script from the prefix folder

import fs from "fs";
import { spawn } from "child_process";

import fsops from "../include/fs-ops.js";
import logging from "../include/logging.js";

export function execScript(filename, params, exitCb) {
    const scriptPath = fsops.getPrefixFile(filename, "scripts");
    const paramsStr  = JSON.stringify(params);

    try {
        if (fs.existsSync(scriptPath)) {
            logging.stdout(`Starting ${scriptPath}`);
    
            const childProcess = spawn(scriptPath, [paramsStr]);
            childProcess.stdout.on("data", (data) => {
                logging.stdout(`stdout: ${data}`, filename);
            });

            childProcess.stderr.on("data", (data) => {
                logging.stderr(`stderr: ${data}`, filename);
            });

            childProcess.on("close", (code) => {
                logging.stdout(`exited with code ${code}`, filename);
                exitCb(code);
            });
        }
    } catch(err) {
        logging.stderr(err);
        exitCb(-1);
    }
}
