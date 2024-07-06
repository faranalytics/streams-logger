import { Logger, Formatter, ConsoleHandler, SyslogLevel } from 'streams-logger';

interface Message {
    [key: string]: string | number;
}

const logger = new Logger<Message>({ level: SyslogLevel.DEBUG });
const formatter = new Formatter<Message, string>({
    format: async ({ isotime, message, level, func, line, col }) => (
        `${isotime}:${level}:${func}:${line}:${col}:${JSON.stringify(message)}\n`
    )
});
const consoleHandler = new ConsoleHandler<string>({ level: SyslogLevel.DEBUG });

const log = logger.connect(
    formatter.connect(
        consoleHandler
    )
);

(function sayHello() {
    log.warn({ greeting: 'Hello, World!', prime_number: 57 });
})();