/* eslint-disable @typescript-eslint/no-unused-vars */
import * as net from 'node:net';
import { once } from 'node:events';
import { Logger, Formatter, ConsoleHandler, SocketHandler, LogRecord, SyslogLevelT, SyslogLevel } from 'streams-logger';

net.createServer((socket: net.Socket) => {
    const socketHandlerIn = new SocketHandler({ socket });
    const socketHandlerOut = new SocketHandler({ socket });
    socketHandlerIn.connect(socketHandlerOut);
}).listen(3000);
const socket = net.createConnection({ port: 3000 });
await once(socket, 'connect');
const socketHandler = new SocketHandler({ socket });

const logger = new Logger({ level: SyslogLevel.DEBUG, name: 'main' });
const formatter = new Formatter({
    format: async ({ isotime, message, name, level, func, url, line, col }) => (
        `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`
    )
});
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

const log = logger.connect(
    formatter.connect(
        socketHandler.connect(
            consoleHandler
        )
    )
);

log.warn('Hello, World!');