
import * as stream from 'node:stream';
import { Transform } from 'graph-transform';
import { LogRecord } from './log_record.js';
import { SyslogLevel, SyslogLevelT } from './syslog.js';

export interface ConsoleHandlerTransformOtions {
    level: SyslogLevel;
}

export class ConsoleHandlerTransform extends stream.Transform {

    public level: SyslogLevel;

    constructor({ level }: ConsoleHandlerTransformOtions) {
        super();
        this.level = level;
    }

    _transform(chunk: LogRecord<string, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback): void {
        if (this.level <= SyslogLevel[chunk.level]) {
            this.push(chunk.message);
        }
        callback();
    }
}

export interface ConsoleHandlerOptions {
    level: SyslogLevel;
}

export class ConsoleHandler extends Transform<LogRecord<string, SyslogLevelT>, string> {

    constructor({ level }: ConsoleHandlerOptions = {level: SyslogLevel.WARN}) {
        super(new ConsoleHandlerTransform({ level }));
        this.stream.pipe(process.stdout);
    }

    setLevel(level: SyslogLevel): void {
        if (this.stream instanceof ConsoleHandlerTransform) {
            this.stream.level = level;
        }
    }
}
