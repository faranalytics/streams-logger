import * as s from 'node:stream';
import { LogRecord } from './log_record.js';
import { Transform } from 'graph-transform';
import { SyslogLevelT } from './syslog.js';

export interface FormatterOptions {
    (record: LogRecord<string, SyslogLevelT>): Promise<string> | string
}

export class Formatter extends Transform<LogRecord<string, SyslogLevelT>, LogRecord<string, SyslogLevelT>> {

    constructor(transform: FormatterOptions, options?: s.TransformOptions) {
        super(new s.Transform({
            ...options, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                transform: async (chunk: LogRecord<string, SyslogLevelT>, encoding: BufferEncoding, callback: s.TransformCallback) => {
                    chunk.message = await transform(chunk);
                    callback(null, chunk);
                }
            }
        }));
    }
}