import * as net from "node:net";
import { ConsoleHandler, Formatter, LogRecord, Logger, SyslogLevel, SyslogLevelT, Transform } from 'streams-logger';

const serializer = async ({ message, name, level, error, func, url, line, col }: LogRecord<string, SyslogLevelT>) => {
    return `${new Date().toISOString()}:${level}:${func}:${line}:${col}:${message}\n`;
}

const logger = new Logger({ level: SyslogLevel.DEBUG });
const formatter = new Formatter(serializer);
const consoleHandler = new ConsoleHandler();

const log = logger.connect(
    formatter.connect(
        consoleHandler
    )
);

function test() {
    log.debug('Hello, world!');
    log.debug('Hello, world!');
}

function main() {
    test();
}

main();

