import * as s from 'node:stream';
import { LogRecord } from './log_record.js';
import { Node } from '@farar/nodes';
import { SyslogLevelT } from './syslog.js';
import { Config } from './index.js';

export interface FilterOptions {
    filter: (record: LogRecord<string, SyslogLevelT>) => Promise<boolean> | boolean
}

export class Filter extends Node<LogRecord<string, SyslogLevelT>, LogRecord<string, SyslogLevelT>> {

    constructor({ filter }: FilterOptions, streamOptions?: s.TransformOptions) {
        super(new s.Transform({
            ...Config.getDuplexDefaults(true, true),
            ...streamOptions, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                transform: async (chunk: LogRecord<string, SyslogLevelT>, encoding: BufferEncoding, callback: s.TransformCallback) => {
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