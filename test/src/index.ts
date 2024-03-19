import * as net from 'node:net';
import { BufferToString, Connector, MessageFormatter, Levels, LevelLogger, Message, StringToBuffer, StringToConsole } from "pipes-logger";

net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000, '127.0.0.1');

const formatter = ({ message, name, level, error, func, url, line, col }: Message<Levels>) => `${name}:${Levels[level]}:${func}:${line}:${col}:${message}`;

const log = new LevelLogger(Levels.DEBUG);
const messageFormatter = new MessageFormatter(formatter);
const stringToBuffer = new StringToBuffer();
const bufferToString = new BufferToString();
const socket = new Connector<Buffer, Buffer>(net.createConnection(3000, '127.0.0.1'))
const stringToConsole = new StringToConsole();

log.connect(messageFormatter).connect(stringToBuffer).connect(socket).connect(bufferToString).connect(stringToConsole);

(function test() {
    log.debug('Hello, World!');
})();