/* eslint-disable @typescript-eslint/no-unused-vars */
import * as fs from 'node:fs';
import * as streams from 'streams-logger';
import * as threads from 'node:worker_threads';
import { Console } from 'node:console';
import * as stream from 'node:stream';

// streams.Config.setDefaultHighWaterMark(true, 1e6);
// streams.Config.setDefaultHighWaterMark(false, 1e6);

const logger = new streams.Logger({ level: streams.SyslogLevel.DEBUG, name:'test' });
const streams_formatter = new streams.Formatter(async ({ isotime, message, name, level, func, url, line, col }) => (
    `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`
));
const streams_formatter_root = new streams.Formatter(async ({ isotime, message, name, level, func, url, line, col }) => (
    `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`
));

const consoleHandler = new streams.ConsoleHandler({ level: streams.SyslogLevel.DEBUG });

streams.root.connect(
    streams_formatter_root.connect(
        consoleHandler
    )
);

const log = logger.connect(
    streams_formatter.connect(
        consoleHandler
    )
);

log.disconnect(streams.root);

function sayHello() {
    log.warn('Hello, World!');
}

sayHello();

setInterval(sayHello, 1e3);
