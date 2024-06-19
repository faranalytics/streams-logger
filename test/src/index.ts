/* eslint-disable @typescript-eslint/no-unused-vars */
import * as net from 'node:net';
import * as stream from 'node:stream';
// import { ConsoleHandler, Formatter, LogRecord, Logger, StringToBuffer, SyslogLevel, SyslogLevelT, Transform, BufferToString, JSONToObject, ObjectToJSON } from 'streams-logger';
import { ConsoleHandler, Formatter, LogRecord, Logger, SyslogLevel, SyslogLevelT, Transform } from 'streams-logger';
import { BufferToString } from './buffer_to_string.js';
import { JSONToObject } from './json_to_object.js';
import { StringToBuffer } from './string_to_buffer.js';
import { ObjectToJSON } from './object_to_json.js';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const serializer = async ({ message, name, level, func, url, line, col }: LogRecord<string, SyslogLevelT>) => {
    return `${new Date().toISOString()}:${level}:${func}:${line}:${col}:${message}\n`;
};

const logger = new Logger({ name: 'main', level: SyslogLevel.DEBUG });
const formatter = new Formatter(serializer);
const consoleHandler = new ConsoleHandler({level: SyslogLevel.DEBUG});
const stringToBuffer = new StringToBuffer();
const bufferToString = new BufferToString();
const objectToJSON = new ObjectToJSON();
const jsonToObject = new JSONToObject<LogRecord<string, SyslogLevelT>>();
const server = net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000);
const socket = net.createConnection({ port: 3000 });
await new Promise((r, e) => socket.once('connect', r).once('error', e));
const socketHandler = new Transform<Buffer, Buffer>(socket);


const log = logger.connect(
    formatter.connect(
        objectToJSON.connect(
            stringToBuffer.connect(
                socketHandler.connect(
                    bufferToString.connect(
                        jsonToObject.connect(
                            consoleHandler
                        )
                    )
                )
            )
        )
    )

);

function test() {
    log.error('TEST');

    // setTimeout(() => { server.close(); socket.destroy(); }, 1000);
}

function main() {
    test();
}

main();
