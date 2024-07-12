import * as stream from 'node:stream';
import { LogContext } from '../commons/log_context.js';
import { Node } from '@farar/nodes';
import { SyslogLevelT } from '../commons/syslog.js';
import { Config } from '../index.js';

export interface FormatterConstructorOptions<MessageInT, MessageOutT> {
    format: (record: LogContext<MessageInT, SyslogLevelT>) => Promise<MessageOutT> | MessageOutT
}

export class Formatter<MessageInT = string, MessageOutT = string> extends Node<LogContext<MessageInT, SyslogLevelT>, LogContext<MessageOutT, SyslogLevelT>> {

    constructor({ format }: FormatterConstructorOptions<MessageInT, MessageOutT>, streamOptions?: stream.TransformOptions) {
        super(new stream.Transform({
            ...Config.getDuplexDefaults(true, true),
            ...streamOptions, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                transform: async (logContext: LogContext<MessageInT, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback) => {
                    try {
                        const logContextOut = new LogContext<MessageOutT, SyslogLevelT>({
                            message: await format(logContext),
                            name: logContext.name,
                            level: logContext.level,
                            func: logContext.func,
                            url: logContext.url,
                            line: logContext.line,
                            col: logContext.col,
                            isotime: logContext.isotime,
                            pathname: logContext.pathname,
                            path: logContext.path,
                            pathdir: logContext.pathdir,
                            pathroot: logContext.pathroot,
                            pathbase: logContext.pathbase,
                            pathext: logContext.pathext,
                            pid: logContext.pid,
                            env: logContext.env,
                            threadid: logContext.threadid,
                            regex: logContext.regex
                        });
                        callback(null, logContextOut);
                    }
                    catch (err) {
                        if (err instanceof Error) {
                            callback(err);
                        }
                    }
                }
            }
        }));
    }
}