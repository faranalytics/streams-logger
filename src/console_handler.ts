
import * as s from 'node:stream';
import { Transform, $stream } from 'graph-transform';
import { LogRecord } from './log_record.js';
import { SyslogLevel, SyslogLevelT } from './syslog.js';
import { Config } from './index.js';

export const $level = Symbol('level');

export interface ConsoleHandlerTransformOtions {
    level: SyslogLevel;
}

export class ConsoleHandlerTransform extends s.Transform {

    public [$level]: SyslogLevel;

    constructor({ level }: ConsoleHandlerTransformOtions, options?: s.TransformOptions) {
        super({
            ...{ highWaterMark: Config.defaultHighWaterMarkObjectMode },
            ...options, ...{ writableObjectMode: true, readableObjectMode: true }
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

export class ConsoleHandler extends Transform<LogRecord<string, SyslogLevelT>, string> {

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
