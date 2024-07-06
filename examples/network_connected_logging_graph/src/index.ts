/* eslint-disable @typescript-eslint/no-unused-vars */
import * as net from 'node:net';
import { once } from 'node:events';
import { Logger, Formatter, ConsoleHandler, SocketHandler, SyslogLevel, RotatingFileHandler } from 'streams-logger';

const serverRotatingFileHandler = new RotatingFileHandler<string>({ path: 'server.log' });
const serverFormatter = new Formatter<string>({ format: async ({ message }) => (`${new Date().toISOString()}:${message}`) });
const formatterNode = serverFormatter.connect(serverRotatingFileHandler);
net.createServer((socket: net.Socket) => {
    const socketHandler = new SocketHandler<string>({ socket });
    socketHandler.connect(
        formatterNode.connect(
            socketHandler
        )
    );
}).listen(3000);

const socket = net.createConnection({ port: 3000 });
await once(socket, 'connect');
const socketHandler = new SocketHandler<string>({ socket });
const logger = new Logger<string>({ name: 'main', level: SyslogLevel.DEBUG });
const formatter = new Formatter<string>({
    format: async ({ isotime, message, name, level, func, url, line, col }) => (
        `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`
    )
});
const consoleHandler = new ConsoleHandler<string>({ level: SyslogLevel.DEBUG });

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