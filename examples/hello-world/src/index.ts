
import { ConsoleHandler, Formatter, LogRecord, Logger, SyslogLevel, SyslogLevelT } from 'streams-logger';

const serializer = async ({ message, name, level, error, func, url, line, col }: LogRecord<string, SyslogLevelT>) => {
    return `${new Date().toISOString()}:${level}:${func}:${line}:${col}:${message}\n`;
}

const logger = new Logger({ level: SyslogLevel.DEBUG });
const formatter1 = new Formatter(serializer);
const formatter2 = new Formatter(serializer);
const handler = new ConsoleHandler();

const log = logger.connect(
    formatter1.connect(handler),
    formatter2.connect(handler),
)

function test() {
    log.debug('TEST');
}

function main() {
    test();
}

main();

