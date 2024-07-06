
import * as stream from 'node:stream';
import { Node, $stream } from '@farar/nodes';
import { LogRecord } from './log_record.js';
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

    _write(chunk: LogRecord<MessageT, SyslogLevelT>, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): void {
        if (SyslogLevel[chunk.level] <= this[$level]) {
            console.log(chunk.message);
            callback();
        }
        else {
            callback();
        }
    }
}

export interface ConsoleHandlerOptions {
    level: SyslogLevel;
}

export class ConsoleHandler<MessageT = string> extends Node<LogRecord<MessageT, SyslogLevelT>, never> {

    constructor({ level }: ConsoleHandlerOptions = { level: SyslogLevel.WARN }, streamOptions?: stream.WritableOptions) {
        super(new ConsoleHandlerTransform<MessageT>({ level }, streamOptions));
    }

    setLevel(level: SyslogLevel): void {
        if (this[$stream] instanceof ConsoleHandlerTransform) {
            this[$stream][$level] = level;
        }
    }
}
