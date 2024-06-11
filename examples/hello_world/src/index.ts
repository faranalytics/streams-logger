import { Logger, Formatter, ConsoleHandler, SyslogLevel } from 'streams-logger';

const logger = new Logger({ level: SyslogLevel.DEBUG });
const formatter = new Formatter(async ($) => `${new Date().toISOString()}:${$.level}:${$.func}:${$.line}:${$.col}:${$.message}\n`);
const consoleHandler = new ConsoleHandler();

const log = logger.connect(
    formatter.connect(
        consoleHandler
    )
);

function sayHello() {
    log.info('Hello, World!');
}

sayHello();
