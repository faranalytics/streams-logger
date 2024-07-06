import * as stream from 'node:stream';
import { Logger, Node, Config, LogRecord, SyslogLevelT } from 'streams-logger';

export class LogRecordToBuffer extends Node<LogRecord<string, SyslogLevelT>, Buffer> {

    public encoding: NodeJS.BufferEncoding = 'utf-8';

    constructor(streamOptions?: stream.TransformOptions) {
        super(new stream.Transform({
            ...Config.getDuplexDefaults(true, false),
            ...streamOptions,
            ...{
                writableObjectMode: true,
                readableObjectMode: false,
                transform: (chunk: LogRecord<string, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback) => {
                    callback(null, Buffer.from(chunk.message, this.encoding));
                }
            }
        })
        );
    }
}

const log = new Logger<string>({ name: 'main' });
const logRecordToBuffer = new LogRecordToBuffer();
const console = new Node<Buffer, never>(process.stdout);

log.connect(
    logRecordToBuffer.connect(
        console
    )
);

log.warn('Hello, World!');

