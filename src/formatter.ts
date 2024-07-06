import * as stream from 'node:stream';
import { LogRecord } from './log_record.js';
import { Node } from '@farar/nodes';
import { SyslogLevelT } from './syslog.js';
import { Config } from './index.js';

export interface FormatterOptions<MessageInT, MessageOutT> {
    format: (record: LogRecord<MessageInT, SyslogLevelT>) => Promise<MessageOutT> | MessageOutT
}

export class Formatter<MessageInT = string, MessageOutT = string> extends Node<LogRecord<MessageInT, SyslogLevelT>, LogRecord<MessageOutT, SyslogLevelT>> {

    constructor({ format }: FormatterOptions<MessageInT, MessageOutT>, streamOptions?: stream.TransformOptions) {
        super(new stream.Transform({
            ...Config.getDuplexDefaults(true, true),
            ...streamOptions, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                transform: async (chunk: LogRecord<MessageInT, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback) => {
                    const message = { ...chunk, ...{ message: await format(chunk) } };
                    callback(null, message);
                }
            }
        }));
    }
}