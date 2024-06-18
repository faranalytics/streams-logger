/* eslint-disable @typescript-eslint/no-unused-vars */
import * as stream from 'node:stream';
import { ConsoleHandler, Formatter, LogRecord, Logger, StringToBuffer, SyslogLevel, SyslogLevelT, Transform, BufferToString } from 'streams-logger';

export interface ObjectToJSONOptions {
    replacer?: (this: unknown, key: string, value: unknown) => unknown;
    space?: string | number;
}

export class ObjectToJSON extends Transform<never, string> {

    constructor({ replacer, space }: ObjectToJSONOptions = {}, options?: stream.TransformOptions) {
        super(new stream.Transform({
            ...options, ...{
                writableObjectMode: true,
                readableObjectMode: false,
                transform: async (chunk: object, _encoding: BufferEncoding, callback: stream.TransformCallback) => {
                    callback(null, JSON.stringify(chunk, replacer, space));
                }
            }
        }));
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const serializer = async ({ message, name, level, func, url, line, col }: LogRecord<string, SyslogLevelT>) => {
    return `${new Date().toISOString()}:${level}:${func}:${line}:${col}:${message}\n`;
};

const logger = new Logger({ name: 'main', level: SyslogLevel.DEBUG });
const formatter = new Formatter(serializer);
// const consoleHandler = new ConsoleHandler();
const stringToBuffer = new StringToBuffer();
const bufferToString = new BufferToString();
const objectToJSON = new ObjectToJSON();

// const server = net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000);
// const socket = net.createConnection({ port: 3000 });
// await new Promise((r, e) => socket.once('connect', r).once('error', e));
// const socketHandler = new Transform<Buffer, Buffer>(socket);


const log = logger.connect(
    formatter.connect(
        objectToJSON.connect(
            stringToBuffer
        )
    )
);

function test() {
    log.debug('TEST');

    // setTimeout(() => { server.close(); socket.destroy(); }, 1000);
}

function main() {
    test();
}

main();
