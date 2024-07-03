
import * as s from 'node:stream';
import { Node, $stream } from '@farar/nodes';
import { LogRecord } from './log_record.js';
import { SyslogLevel, SyslogLevelT } from './syslog.js';
import { Config } from './index.js';

export const $level = Symbol('level');

export interface ConsoleHandlerTransformOtions {
    level: SyslogLevel;
}

export class ConsoleHandlerTransform extends s.Transform {

    public [$level]: SyslogLevel;

    constructor({ level }: ConsoleHandlerTransformOtions, streamOptions?: s.TransformOptions) {
        super({
            ...Config.getDuplexDefaults(true, true),
            ...streamOptions, 
            ...{ writableObjectMode: true, readableObjectMode: true }
        });
        this[$level] = level;
    }

    _transform(chunk: LogRecord<string, SyslogLevelT>, encoding: BufferEncoding, callback: s.TransformCallback): void {
        if (SyslogLevel[chunk.level] <= this[$level]) {
            callback(null, chunk.message);
        }
        else {
            callback();
        }
    }
}

export interface ConsoleHandlerOptions {
    level: SyslogLevel;
}

export class ConsoleHandler extends Node<LogRecord<string, SyslogLevelT>, string> {

    constructor({ level }: ConsoleHandlerOptions = { level: SyslogLevel.WARN }, transformOptions?: s.TransformOptions) {
        super(new ConsoleHandlerTransform({ level }, transformOptions));
        this[$stream].pipe(process.stdout);
    }

    setLevel(level: SyslogLevel): void {
        if (this[$stream] instanceof ConsoleHandlerTransform) {
            this[$stream][$level] = level;
        }
    }
}
