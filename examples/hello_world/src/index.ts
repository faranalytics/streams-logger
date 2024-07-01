/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger, Formatter, ConsoleHandler, SyslogLevel } from 'streams-logger';

const logger = new Logger({ level: SyslogLevel.DEBUG });
const formatter = new Formatter({
    format: async ({ isotime, message, name, level, func, url, line, col }) => (
        `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`
    )
});
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

const log = logger.connect(
    formatter.connect(
        consoleHandler
    )
);

function sayHello() {
    log.info('Hello, World!');
}

setInterval(sayHello, 1e3);

sayHello();
