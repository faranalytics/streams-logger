import * as stream from 'node:stream';
import { LogContext } from '../commons/log_context.js';
import { Node } from '@farar/nodes';
import { SyslogLevelT } from '../commons/syslog.js';
import { Config } from '../index.js';

export interface FilterOptions<MessageT> {
    filter: (logContext: LogContext<MessageT, SyslogLevelT>) => Promise<boolean> | boolean
}

export class Filter<MessageT = string> extends Node<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>> {

    constructor({ filter }: FilterOptions<MessageT>, streamOptions?: stream.TransformOptions) {
        super(new stream.Transform({
            ...Config.getDuplexOptions(true, true),
            ...streamOptions, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                transform: async (logContext: LogContext<MessageT, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback) => {
                    try {
                        if (await filter(logContext)) {
                            callback(null, logContext);
                        }
                        else {
                            callback();
                        }
                    }
                    catch (err) {
                        if (err instanceof Error) {
                            callback(err);
                            Config.errorHandler(err);
                        }
                    }
                }
            }
        }));
    }
}