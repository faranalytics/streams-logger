
import { ConsoleHandler, Formatter, LogRecord, Logger, SyslogLevelT } from 'streams-logger';

const serializer = async ({ message, name, level, error, func, url, line, col }: LogRecord<string, SyslogLevelT>) => `${new Date().toISOString()}:${level}:${func}:${line}:${col}:${message}\n`;


const logger = new Logger();
const formatter = new Formatter(serializer)
const handler = new ConsoleHandler();

logger.connect(formatter).connect(handler);

function test() {
    logger.error('TEST');
}

test();

