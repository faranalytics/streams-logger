import * as s from 'node:stream';
import { LogRecord } from './log_record.js';
import { Transform, $write, $size} from 'graph-transform';
import { SyslogLevel, SyslogLevelT } from './syslog.js';
import { KeysUppercase } from './types.js';
import { QueueSizeLimitExceededError } from './errors.js';

export interface LogData {
    message: string;
    name: string;
    level: KeysUppercase<SyslogLevelT>;
    error: Error;
}

export interface LoggerOptions {
    level?: SyslogLevel;
    name?: string;
    queueSizeLimit?: number;
}

export class Logger extends Transform<LogData, LogRecord<string, SyslogLevelT>> {

    public level: SyslogLevel;
    public name: string;

    private queueSizeLimit?: number;

    constructor({ name, level, queueSizeLimit }: LoggerOptions = {}, options?: s.TransformOptions) {
        super(new s.Transform({
            ...options, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                transform: (chunk: LogData, encoding: BufferEncoding, callback: s.TransformCallback) => {
                    const record = new LogRecord<string, SyslogLevelT>({ ...{ depth: 2 }, ...chunk });
                    callback(null, record);
                }
            }
        }));
        this.level = level ?? SyslogLevel.WARN;
        this.name = name ?? '';
        this.queueSizeLimit = queueSizeLimit;
    }

    private log(data: LogData) {
        try{
            super[$write](data);
            if (this.queueSizeLimit && this[$size] > this.queueSizeLimit) {
                throw new QueueSizeLimitExceededError(`The queue size limit, ${this.queueSizeLimit}, is exceeded.`);
            }
        }
        catch(err) {
            if (err instanceof QueueSizeLimitExceededError) {
                throw err;
            }
            else {
                console.error(err);
            }
        }
    }

    public debug(message: string): void {
        if (this.level && this.level >= SyslogLevel.DEBUG) {
            this.log({ message, name: this.name, level: 'DEBUG', error: new Error });
        }
    }

    public info(message: string): void {
        if (this.level && this.level >= SyslogLevel.INFO) {
            this.log({ message, name: this.name, level: 'INFO', error: new Error });
        }
    }

    public notice(message: string): void {
        if (this.level && this.level >= SyslogLevel.NOTICE) {
            this.log({ message, name: this.name, level: 'NOTICE', error: new Error });
        }
    }

    public warn(message: string): void {
        if (this.level && this.level >= SyslogLevel.WARN) {
            this.log({ message, name: this.name, level: 'WARN', error: new Error });
        }
    }

    public error(message: string): void {
        if (this.level && this.level >= SyslogLevel.ERROR) {
            this.log({ message, name: this.name, level: 'ERROR', error: new Error });
        }
    }

    public crit(message: string): void {
        if (this.level && this.level >= SyslogLevel.CRIT) {
            this.log({ message, name: this.name, level: 'CRIT', error: new Error });
        }
    }

    public alert(message: string): void {
        if (this.level && this.level >= SyslogLevel.ALERT) {
            this.log({ message, name: this.name, level: 'ALERT', error: new Error });
        }
    }

    public emerg(message: string): void {
        if (this.level && this.level >= SyslogLevel.EMERG) {
            this.log({ message, name: this.name, level: 'EMERG', error: new Error });
        }
    }

    public setLevel(level: SyslogLevel) {
        this.level = level;
    }
}