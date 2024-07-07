import * as stream from 'node:stream';
import { LogContext } from '../commons/log_context.js';
import { Node } from '@farar/nodes';
import { SyslogLevelT } from '../commons/syslog.js';
import { Config } from '../index.js';

export interface FilterConstructorOptions<MessageT> {
    filter: (record: LogContext<MessageT, SyslogLevelT>) => Promise<boolean> | boolean
}

export class Filter<MessageT = string> extends Node<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>> {

    constructor({ filter }: FilterConstructorOptions<MessageT>, streamOptions?: stream.TransformOptions) {
        super(new stream.Transform({
            ...Config.getDuplexDefaults(true, true),
            ...streamOptions, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                transform: async (chunk: LogContext<MessageT, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback) => {
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