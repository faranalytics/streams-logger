/* eslint-disable @typescript-eslint/no-unused-vars */
import * as fs from 'node:fs';
import { Logger, Formatter, ConsoleHandler, SyslogLevel } from 'streams-logger';

// fs.readdirSync('.', { withFileTypes: true }).forEach((value: fs.Dirent) => {
//     if (value.name.match(/[^.]+.log.\d+/)) {
//         fs.rmSync(value.name);
//     }
// });

const logger = new Logger({ level: SyslogLevel.DEBUG });
const consoleFormatter = new Formatter({
    format: async ({level, isotime, hostname, pid, message,  }) => (
        `<${level}> ${isotime} ${hostname} ${pid} - ${message}\n`
    )
});

const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

const log = logger.connect(
    consoleFormatter.connect(
        consoleHandler
    )
);

function sayHello() {
    for (let i = 0; i < 1e1; i++) {
        log.debug('Hello, World!');
    }
}

sayHello();

// process.once('exit', () => {
//     fs.readdirSync('.', { withFileTypes: true }).forEach((value: fs.Dirent) => {
//         if (value.name.match(/[^.]+.log.\d+/)) {
//             fs.rmSync(value.name);
//         }
//     });
// });