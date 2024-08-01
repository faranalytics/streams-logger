/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger, Formatter, ConsoleHandler, SyslogLevel, RotatingFileHandler } from 'streams-logger';

const logger = new Logger({ name: 'hello-logger', level: SyslogLevel.DEBUG });
const consoleFormatter = new Formatter({
    format: ({ isotime, message, name, level, func, url, line, col }) => (
        `${name}:${isotime}:${level}:${message}\n`
    )
});
const fileFortmatter = new Formatter({
    format: ({ isotime, message, name, level, func, url, line, col }) => (
        `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`
    )
});
const rotatingFileHandler = new RotatingFileHandler({ path: './message.log', rotationLimit: 0, level: SyslogLevel.DEBUG });
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
    log.info('Hello, World!');
}

sayHello();
