import * as stream from 'node:stream';
import { LogRecord } from './log_record.js';
import { Node } from '@farar/nodes';
import { SyslogLevelT } from './syslog.js';
import { Config } from './index.js';

export interface FilterOptions<MessageT> {
    filter: (record: LogRecord<MessageT, SyslogLevelT>) => Promise<boolean> | boolean
}

export class Filter<MessageT = string> extends Node<LogRecord<MessageT, SyslogLevelT>, LogRecord<MessageT, SyslogLevelT>> {

    constructor({ filter }: FilterOptions<MessageT>, streamOptions?: stream.TransformOptions) {
        super(new stream.Transform({
            ...Config.getDuplexDefaults(true, true),
            ...streamOptions, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                transform: async (chunk: LogRecord<MessageT, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback) => {
                    if (await filter(chunk)) {
                        callback(null, chunk);
                    }
                    else {
                        callback();
                    }
                }
            }
        }));
    }
}