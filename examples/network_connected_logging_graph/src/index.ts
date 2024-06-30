/* eslint-disable @typescript-eslint/no-unused-vars */
import * as net from 'node:net';
import { once } from 'node:events';
import { Logger, Formatter, ConsoleHandler, SocketHandler, LogRecord, SyslogLevelT, SyslogLevel } from 'streams-logger';

net.createServer((socket: net.Socket) => {
    const socketHandler1 = new SocketHandler<LogRecord<string, SyslogLevelT>, LogRecord<string, SyslogLevelT>>({ socket });
    const socketHandler2 = new SocketHandler<LogRecord<string, SyslogLevelT>, LogRecord<string, SyslogLevelT>>({ socket });
    socketHandler1.connect(socketHandler2);
}).listen(3000);
const socket = net.createConnection({ port: 3000 });
await once(socket, 'connect');
const socketHandler = new SocketHandler<LogRecord<string, SyslogLevelT>, LogRecord<string, SyslogLevelT>>({ socket });

const logger = new Logger({ level: SyslogLevel.DEBUG, name: 'main' });
const formatter = new Formatter(async ({ isotime, message, name, level, func, url, line, col }) => (
    `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`
));
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

const log = logger.connect(
    formatter.connect(
        socketHandler.connect(
            consoleHandler
        )
    )
);

log.warn('Hello, World!');