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

export class ConsoleHandlerWritable<MessageT> extends stream.Writable {

    public level: SyslogLevel;

    constructor({ level }: ConsoleHandlerConstructorOptions, streamOptions?: stream.WritableOptions) {
        super({
            ...Config.getWritableDefaults(true),
            ...streamOptions,
            ...{ objectMode: true }
        });
        this.level = level ?? SyslogLevel.WARN;
    }

    async _write(chunk: LogContext<MessageT, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback): Promise<void> {
        try {
            if (chunk.level && SyslogLevel[chunk.level] <= this.level && (typeof chunk.message == 'string' || chunk.message instanceof Buffer)) {
                if (!process.stdout.write(chunk.message)) {
                    await once(process.stdout, 'drain');
                }
            }
            callback();
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
