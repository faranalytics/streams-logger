import * as net from "node:net";
import { ConsoleHandler, Formatter, LogRecord, Logger, StringToBuffer, SyslogLevel, SyslogLevelT, Transform, BufferToString } from 'streams-logger';

const serializer = async ({ message, name, level, func, url, line, col }: LogRecord<string, SyslogLevelT>) => {
    return `${new Date().toISOString()}:${level}:${func}:${line}:${col}:${message}\n`;
}

const logger = new Logger({ name: 'main', level: SyslogLevel.DEBUG });
const formatter = new Formatter(serializer);
const consoleHandler = new ConsoleHandler();
const stringToBuffer = new StringToBuffer();
const bufferToString = new BufferToString();

const server = net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000);
const socket = net.createConnection({ port: 3000 });
await new Promise((r, e) => socket.once('connect', r).once('error', e));
const socketHandler = new Transform<Buffer, Buffer>(socket);

const log = logger.connect(
    formatter.connect(
        stringToBuffer.connect(
            socketHandler.connect(
                bufferToString.connect(
                    consoleHandler
                )
            )
        )
    )
)

function test() {
    log.debug('TEST');

    setTimeout(() => { server.close(); socket.destroy() }, 1000);
}

function main() {
    test();
}

main();
