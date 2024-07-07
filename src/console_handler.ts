
import * as stream from 'node:stream';
import { once } from 'node:events';
import { Node, $stream } from '@farar/nodes';
import { LogContext } from './log_context.js';
import { SyslogLevel, SyslogLevelT } from './syslog.js';
import { Config } from './index.js';

export const $level = Symbol('level');

export interface ConsoleHandlerTransformOptions {
    level: SyslogLevel;
}

export class ConsoleHandlerTransform<MessageT> extends stream.Writable {

    public [$level]: SyslogLevel;

    constructor({ level }: ConsoleHandlerOptions, streamOptions?: stream.WritableOptions) {
        super({
            ...Config.getWritableDefaults(true),
            ...streamOptions,
            ...{ objectMode: true }
        });
        this[$level] = level;
    }

    async _write(chunk: LogContext<MessageT, SyslogLevelT>, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): Promise<void> {
        try {
            if (chunk.level && SyslogLevel[chunk.level] <= this[$level] && (typeof chunk.message == 'string' || chunk.message instanceof Buffer)) {
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

export interface ConsoleHandlerOptions {
    level: SyslogLevel;
}

export class ConsoleHandler<MessageT = string> extends Node<LogContext<MessageT, SyslogLevelT>, never> {

    constructor({ level }: ConsoleHandlerOptions = { level: SyslogLevel.WARN }, streamOptions?: stream.WritableOptions) {
        super(new ConsoleHandlerTransform<MessageT>({ level }, streamOptions));
    }

    setLevel(level: SyslogLevel): void {
        if (this[$stream] instanceof ConsoleHandlerTransform) {
            this[$stream][$level] = level;
        }
    }
}
