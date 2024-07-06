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
                    const logRecord = new LogRecord<MessageOutT, SyslogLevelT>({
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
                        threadid: chunk.threadid
                    });
                    callback(null, logRecord);
                }
            }
        }));
    }
}