/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger, Formatter, ConsoleHandler, SyslogLevel, Config } from 'streams-logger';

Config.highWaterMark = 1e5;
Config.highWaterMarkObjectMode = 1e5;

const logger = new Logger({ name: 'hello-logger', level: SyslogLevel.DEBUG, parent: null, captureStackTrace: false });
const formatter = new Formatter({
    format: ({ isotime, message, name, level, label }) => (
        `${name}:${isotime}:${level}:${label}:${message}\n`
    )
});
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

const log = logger.connect(
    formatter.connect(
        consoleHandler
    )
);

function sayHello() {
    log.info('Hello, World!', sayHello.name);
}

setInterval(sayHello, 1e3);

sayHello();
