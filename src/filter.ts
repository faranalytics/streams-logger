import * as s from 'node:stream';
import { LogRecord } from './log_record.js';
import { Node } from '@farar/nodes';
import { SyslogLevelT } from './syslog.js';
import { Config } from './index.js';

export interface FilterOptions<T> {
    filter: (record: LogRecord<T, SyslogLevelT>) => Promise<boolean> | boolean
}

export class Filter<T> extends Node<LogRecord<T, SyslogLevelT>, LogRecord<T, SyslogLevelT>> {

    constructor({ filter }: FilterOptions<T>, streamOptions?: s.TransformOptions) {
        super(new s.Transform({
            ...Config.getDuplexDefaults(true, true),
            ...streamOptions, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                transform: async (chunk: LogRecord<T, SyslogLevelT>, encoding: BufferEncoding, callback: s.TransformCallback) => {
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