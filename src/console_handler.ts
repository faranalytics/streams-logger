
import * as s from 'node:stream';
import { Transform, $stream } from 'graph-transform';
import { LogRecord } from './log_record.js';
import { SyslogLevel, SyslogLevelT } from './syslog.js';

export interface ConsoleHandlerTransformOtions {
    level: SyslogLevel;
}

export class ConsoleHandlerTransform extends s.Transform {

    public level: SyslogLevel;

    constructor({ level }: ConsoleHandlerTransformOtions) {
        super({ writableObjectMode: true, readableObjectMode: false });
        this.level = level;
    }

    _transform(chunk: LogRecord<string, SyslogLevelT>, encoding: BufferEncoding, callback: s.TransformCallback): void {
        if (SyslogLevel[chunk.level] <= this.level) {
            this.push(chunk.message);
        }
        callback();
    }
}

export interface ConsoleHandlerOptions {
    level: SyslogLevel;
}

export class ConsoleHandler extends Transform<LogRecord<string, SyslogLevelT>, string> {

    constructor({ level }: ConsoleHandlerOptions = { level: SyslogLevel.WARN }) {
        super(new ConsoleHandlerTransform({ level }));
        this[$stream].pipe(process.stdout);
    }

    setLevel(level: SyslogLevel): void {
        if (this[$stream] instanceof ConsoleHandlerTransform) {
            this[$stream].level = level;
        }
    }
}
