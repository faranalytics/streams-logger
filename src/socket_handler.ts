
import * as s from 'node:stream';
import { Transform, $stream } from 'graph-transform';
import { LogRecord } from './log_record.js';
import { SyslogLevel, SyslogLevelT } from './syslog.js';
import { Config } from './index.js';

export const $level = Symbol('level');

export interface SocketHandlerTransformOtions {
    level: SyslogLevel;
}

export class SocketHandlerTransform extends s.Transform {

    public [$level]: SyslogLevel;

    constructor({ level }: SocketHandlerTransformOtions, streamOptions?: s.TransformOptions) {
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

export interface SocketHandlerOptions {
    level: SyslogLevel;
}

export class SocketHandler extends Transform<LogRecord<string, SyslogLevelT>, string> {

    constructor({ level }: SocketHandlerOptions = { level: SyslogLevel.WARN }, transformOptions?: s.TransformOptions) {
        super(new SocketHandlerTransform({ level }, transformOptions));
        this[$stream].pipe(process.stdout);
    }

    setLevel(level: SyslogLevel): void {
        if (this[$stream] instanceof SocketHandlerTransform) {
            this[$stream][$level] = level;
        }
    }
}
