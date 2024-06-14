import * as net from "node:net";
import * as stream from "node:stream";
import { ConsoleHandler, Formatter, LogRecord, Logger, StringToBuffer, SyslogLevel, SyslogLevelT, Transform, BufferToString } from 'streams-logger';
import { TemporalTransform } from "./temporal_transform.js";

const serializer = async ({ message, name, level, func, url, line, col }: LogRecord<string, SyslogLevelT>) => {
    return `${new Date().toISOString()}:${level}:${func}:${line}:${col}:${message}\n`;
}

const logger = new Logger({ name: 'main', level: SyslogLevel.DEBUG });
const formatter = new Formatter(serializer);
const consoleHandler = new ConsoleHandler();
const temporalTransform1 = new TemporalTransform({ time: 5000 });
const temporalTransform2 = new TemporalTransform({ time: 1000 });
const stringToBuffer = new StringToBuffer();
const bufferToString = new BufferToString();

net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000);
const socket = net.createConnection({ port: 3000 });
await new Promise((r, e) => socket.once('connect', r).once('error', e));
const socketHandler = new Transform<Buffer, Buffer>(socket);

const log = logger.connect(
    formatter.connect(
        temporalTransform1.connect(
            consoleHandler
        ),
        temporalTransform2.connect(
            consoleHandler
        ),
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
}

function main() {
    test();
}

main();
