/* eslint-disable @typescript-eslint/no-unused-vars */
import * as fs from 'node:fs';
import { Logger, Formatter, ConsoleHandler, SyslogLevel, RotatingFileHandler } from 'streams-logger';

fs.readdirSync('.', { withFileTypes: true }).forEach((value: fs.Dirent) => {
    if (value.name.match(/[^.]+.log.\d+/)) {
        fs.rmSync(value.name);
    }
});

const logger = new Logger({ level: SyslogLevel.DEBUG });
const consoleFormatter = new Formatter({
    format: async ({ isotime, message, level }) => (
        `${isotime}:${level}:${message}\n`
    )
});
const fileFortmatter = new Formatter({
    format: async ({ isotime, message, level }) => (
        `${isotime}:${level}:${message}\n`
    )
});
const rotatingFileHandler = new RotatingFileHandler({ path: './message.log', rotationLimit: 10, level: SyslogLevel.DEBUG });
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

const log = logger.connect(
    consoleFormatter.connect(
        consoleHandler
    ),
    fileFortmatter.connect(
        rotatingFileHandler
    )
);

function sayHello() {
    for (let i = 0; i < 1e4; i++) {
        log.warn('0123456789012345678'.repeat(1e3));
    }
}

sayHello();

process.once('exit', () => {
    fs.readdirSync('.', { withFileTypes: true }).forEach((value: fs.Dirent) => {
        if (value.name.match(/[^.]+.log.\d+/)) {
            fs.rmSync(value.name);
        }
    });
});