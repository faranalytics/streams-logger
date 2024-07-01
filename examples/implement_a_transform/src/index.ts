import * as stream from 'node:stream';
import { Logger, Transform, Config, LogRecord, SyslogLevelT } from 'streams-logger';

export class LogRecordToBuffer extends Transform<LogRecord<string, SyslogLevelT>, Buffer> {

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

const log = new Logger();
const messageToHex = new LogRecordToBuffer();
const console = new Transform<Buffer, never>(process.stdout)

log.connect(
    messageToHex.connect(
        console
    )
);

log.warn('Hello, World!\n');

