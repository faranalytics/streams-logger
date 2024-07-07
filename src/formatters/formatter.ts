import * as stream from 'node:stream';
import { LogContext } from '../commons/log_context.js';
import { Node } from '@farar/nodes';
import { SyslogLevelT } from '../commons/syslog.js';
import { Config } from '../index.js';

export interface FormatterOptions<MessageInT, MessageOutT> {
    format: (record: LogContext<MessageInT, SyslogLevelT>) => Promise<MessageOutT> | MessageOutT
}

export class Formatter<MessageInT = string, MessageOutT = string> extends Node<LogContext<MessageInT, SyslogLevelT>, LogContext<MessageOutT, SyslogLevelT>> {

    constructor({ format }: FormatterOptions<MessageInT, MessageOutT>, streamOptions?: stream.TransformOptions) {
        super(new stream.Transform({
            ...Config.getDuplexDefaults(true, true),
            ...streamOptions, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                transform: async (chunk: LogContext<MessageInT, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback) => {
                    const logContext = new LogContext<MessageOutT, SyslogLevelT>({
                        message: await format(chunk),
                        name: chunk.name,
                        level: chunk.level,
                        func: chunk.func,
                        url: chunk.url,
                        line: chunk.line,
                        col: chunk.col,
                        isotime: chunk.isotime,
                        pathname: chunk.pathname,
                        path: chunk.path,
                        pathdir: chunk.pathdir,
                        pathroot: chunk.pathroot,
                        pathbase: chunk.pathbase,
                        pathext: chunk.pathext,
                        pid: chunk.pid,
                        env: chunk.env,
                        threadid: chunk.threadid,
                        regex: chunk.regex
                    });
                    callback(null, logContext);
                }
            }
        }));
    }
}