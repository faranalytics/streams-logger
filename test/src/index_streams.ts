/* eslint-disable @typescript-eslint/no-unused-vars */
import * as streams from 'streams-logger';

const logger = new streams.Logger({ level: streams.SyslogLevel.DEBUG });
const streams_formatter = new streams.Formatter(async ({ isotime, message, name, level, func, url, line, col }) => (
    `${isotime}:${level}:${func}:${line}:${col}:${message}\n`
));
const consoleHandler = new streams.ConsoleHandler({ level: streams.SyslogLevel.DEBUG });
const rotatingFileHandler = new streams.RotatingFileHandler({ path: './streams.log', level: streams.SyslogLevel.DEBUG });

const streams_log = logger.connect(
    streams_formatter.connect(
        consoleHandler,
        rotatingFileHandler
    )
);

function streamsSayHello() {
    console.time('streams');
    for(let i = 0; i < 1e4; i++) {
        streams_log.info('Hello, World!');
    }}

streamsSayHello();

process.on('exit', () => {
    console.timeEnd('streams');
});
