const { Logger, Formatter, ConsoleHandler, SyslogLevel, RotatingFileHandler } = require('streams-logger');

const logger = new Logger({ name: 'hello-logger', level: SyslogLevel.DEBUG });
const formatter = new Formatter({
    format: async ({ isotime, message, name, level, func, line, col }) => (
        `${name}:${isotime}:${level}:${func}:${line}:${col}:${JSON.stringify(message)}\n`
    )
});

const rotatingFileHandler = new RotatingFileHandler({ path: './message.log', rotationLimit: 0, level: SyslogLevel.DEBUG });
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

const log = logger.connect(
    formatter.connect(
        consoleHandler,
        rotatingFileHandler
    )
);

function sayHello() {
    log.warn("Hello, World!");
    log.debug({ 'Greeting': 'Hello, World!' });
}

setInterval(sayHello, 1000);