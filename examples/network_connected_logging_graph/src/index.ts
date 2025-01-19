import * as net from 'node:net';
import { once } from 'node:events';
import { Worker } from 'node:worker_threads';
import { Logger, Formatter, ConsoleHandler, SocketHandler, SyslogLevel } from 'streams-logger';

const worker = new Worker('./dist/logging_server.js');

await once(worker, 'message'); // Wait for the server to bind to the interface.

const socket = net.createConnection({ port: 3000, host: '127.0.0.1' });
await once(socket, 'connect');
const socketHandler = new SocketHandler({ socket });
const logger = new Logger({ name: 'main', level: SyslogLevel.DEBUG });
const formatter = new Formatter({
    format: ({ isotime, message, name, level, func, line, col }) => (
        `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`
    )
});
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

// 1. Connect the logger to the fomatter.
// 2. Connect the fommater to the consoleHandler and the socketHandler.
// 3. Connect the socketHandler to the consoleHandler.
const log = logger.connect(
    formatter.connect(
        consoleHandler,
        socketHandler.connect(
            consoleHandler
        )
    )
);

(function sayHello() {
    log.warn('Hello, World!');
})();