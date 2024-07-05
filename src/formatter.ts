import * as s from 'node:stream';
import { LogRecord } from './log_record.js';
import { Node } from '@farar/nodes';
import { SyslogLevelT } from './syslog.js';
import { Config } from './index.js';

export interface FormatterOptions<T> {
    format: (record: LogRecord<T, SyslogLevelT>) => Promise<T> | T
}

export class Formatter<T> extends Node<LogRecord<T, SyslogLevelT>, LogRecord<T, SyslogLevelT>> {

    constructor({ format }: FormatterOptions<T>, streamOptions?: s.TransformOptions) {
        super(new s.Transform({
            ...Config.getDuplexDefaults(true, true),
            ...streamOptions, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                transform: async (chunk: LogRecord<T, SyslogLevelT>, encoding: BufferEncoding, callback: s.TransformCallback) => {
                    chunk.message = await format(chunk);
                    callback(null, chunk);
                }
            }
        }));
    }
}