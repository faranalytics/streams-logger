import * as s from 'node:stream';
import { LogRecord } from './log_record.js';
import { Transform } from 'graph-transform';
import { SyslogLevelT } from './syslog.js';
import { Config } from './index.js';

export interface FormatterOptions {
    format: (record: LogRecord<string, SyslogLevelT>) => Promise<string> | string
}

export class Formatter extends Transform<LogRecord<string, SyslogLevelT>, LogRecord<string, SyslogLevelT>> {

    constructor({ format }: FormatterOptions, streamOptions?: s.TransformOptions) {
        super(new s.Transform({
            ...Config.getDuplexDefaults(true, true),
            ...streamOptions, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                transform: async (chunk: LogRecord<string, SyslogLevelT>, encoding: BufferEncoding, callback: s.TransformCallback) => {
                    chunk.message = await format(chunk);
                    callback(null, chunk);
                }
            }
        }));
    }
}