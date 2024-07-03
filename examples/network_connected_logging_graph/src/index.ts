/* eslint-disable @typescript-eslint/no-unused-vars */
import * as net from 'node:net';
import { once } from 'node:events';
import { Logger, Formatter, ConsoleHandler, SocketHandler, SyslogLevel, RotatingFileHandler } from 'streams-logger';

const serverRotatingFileHandler = new RotatingFileHandler({ path: 'server.log' });
const serverFormatter = new Formatter({ format: async ({ message }) => (`${new Date().toISOString()}:${message}`) });
const formatterNode = serverFormatter.connect(serverRotatingFileHandler);
net.createServer((socket: net.Socket) => {
    const socketHandler = new SocketHandler({ socket });
    socketHandler.connect(
        formatterNode.connect(
            socketHandler
        )
    );
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
        consoleHandler,
        socketHandler.connect(
            consoleHandler
        )
    )
);

(function sayHello() {
    log.warn('Hello, World!');
})();