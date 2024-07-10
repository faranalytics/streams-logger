/* eslint-disable @typescript-eslint/no-unused-vars */

import * as stream from 'node:stream';
import { once } from 'node:events';
import { Node, $stream } from '@farar/nodes';
import { LogContext } from '../commons/log_context.js';
import { SyslogLevel, SyslogLevelT } from '../commons/syslog.js';
import { Config } from '../index.js';

export interface ConsoleHandlerWritableOptions {
    level: SyslogLevel;
}

export class ConsoleHandlerWritable<MessageT> extends stream.Transform {

    public level: SyslogLevel;

    constructor({ level }: ConsoleHandlerConstructorOptions, streamOptions?: stream.WritableOptions) {
        super({
            ...Config.getWritableDefaults(true),
            ...streamOptions,
            ...{ objectMode: true }
        });
        this.level = level ?? SyslogLevel.WARN;
        this.once('error', () => this.unpipe(process.stdout)).pipe(process.stdout);
    }

    async _transform(chunk: LogContext<MessageT, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback): Promise<void> {
        try {
            if (SyslogLevel[chunk.level] <= this.level) {
                const message: string | Buffer = (typeof chunk.message == 'string' || chunk.message instanceof Buffer) ? chunk.message : JSON.stringify(chunk.message);
                callback(null, chunk.message);
            }
            else {
                callback();
            }
        }
        catch (err) {
            if (err instanceof Error) {
                callback(err);
            }
        }
    }
}

export interface ConsoleHandlerConstructorOptions {
    level?: SyslogLevel;
}

export class ConsoleHandler<MessageT = string> extends Node<LogContext<MessageT, SyslogLevelT>, never> {

    constructor(options: ConsoleHandlerConstructorOptions, streamOptions?: stream.WritableOptions) {
        super(new ConsoleHandlerWritable<MessageT>(options, streamOptions));
    }

    setLevel(level: SyslogLevel): void {
        if (this[$stream] instanceof ConsoleHandlerWritable) {
            this[$stream].level = level;
        }
    }
}
