import * as net from 'node:net';
import { BufferToString, Connector, MessageFormatter, Levels, LevelLogger, Message, StringToBuffer, StringToConsole } from "streams-logger";

// net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000, '127.0.0.1');

net.createServer((socket: net.Socket) => {
    socket.on('error', console.error);
    socket.pipe(socket);
    // setTimeout(()=>{
    //     socket.destroy(new Error('TEST'));
    // }, 1000)
}).listen(3000, '127.0.0.1');

const formatter = ({ message, name, level, error, func, url, line, col }: Message<Levels>) => `${name}:${Levels[level]}:${func}:${line}:${col}:${message}`;

const log = new LevelLogger({ name: 'Greetings', level: Levels.DEBUG });
const messageFormatter = new MessageFormatter(formatter);
const stringToBuffer = new StringToBuffer();
const echoServer = new Connector<Buffer, Buffer>(net.createConnection(3000, '127.0.0.1'));
const bufferToString = new BufferToString();
const stringToConsole = new StringToConsole();

log.connect(
    messageFormatter
).connect(
    stringToBuffer
).connect(
    echoServer
).connect(
    bufferToString
).connect(
    stringToConsole
);

(function sayHello() {
    log.debug('Hello, World!');
})();