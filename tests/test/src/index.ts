/* eslint-disable @typescript-eslint/no-unused-vars */
import * as net from 'node:net';

import {
    ConsoleHandler,
    Formatter,
    LogRecord,
    Logger,
    SyslogLevel,
    SyslogLevelT,
    Transform,
    BufferToString,
    JSONToObject,
    StringToBuffer,
    ObjectToJSON,
    RotatingFileHandler
} from 'streams-logger';


const server = net.createServer((socket: net.Socket) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const formatter = new Formatter(async ({ message, name, level, func, url, line, col }) => (
        `${new Date().toISOString()}:${level}:${func}:${line}:${col}:${message}\n`
    ));    const bufferToString = new BufferToString();
    const objectToJSON = new ObjectToJSON();
    const jsonToObject = new JSONToObject<LogRecord<string, SyslogLevelT>>();
    const stringToBuffer = new StringToBuffer();
    const socketTransform = new Transform<Buffer, Buffer>(socket);
    socketTransform.connect(
        bufferToString.connect(
            jsonToObject.connect(
                formatter.connect(
                    objectToJSON.connect(
                        stringToBuffer.connect(
                            socketTransform
                        )
                    )
                )
            )
        )
    );
}).listen(3000);
const socket = net.createConnection({ port: 3000 });
await new Promise((r, e) => socket.once('connect', r).once('error', e));

const logger = new Logger({ name: 'main', level: SyslogLevel.DEBUG });
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });
const stringToBuffer = new StringToBuffer();
const bufferToString = new BufferToString();
const objectToJSON = new ObjectToJSON();
const jsonToObject = new JSONToObject<LogRecord<string, SyslogLevelT>>();
const rotatingFileHandler = new RotatingFileHandler({ path: './message.log' });
const socketTransform = new Transform<Buffer, Buffer>(socket);

const log = logger.connect(
    objectToJSON.connect(
        stringToBuffer.connect(
            socketTransform.connect(
                bufferToString.connect(
                    jsonToObject.connect(
                        consoleHandler,
                        rotatingFileHandler
                    )
                )
            )
        )
    )
);

function test() {
    log.warn('TEST');
    // setTimeout(() => { server.close(); socket.destroy(); }, 1000);
}

function main() {
    test();
}

main();