import * as stream from 'node:stream';
import { LogRecord } from './log_record.js';
import { Transform, $write, $size } from 'graph-transform';
import { SyslogLevel, SyslogLevelT } from './syslog.js';
import { KeysUppercase } from './types.js';
import { QueueSizeLimitExceededError } from './errors.js';
import { Config } from './index.js';

export interface LoggerOptions {
    level?: SyslogLevel;
    name?: string;
    queueSizeLimit?: number;
}

export class Logger extends Transform<LogRecord<string, SyslogLevelT>, LogRecord<string, SyslogLevelT>> {

    public level: SyslogLevel;
    public name: string;

    private queueSizeLimit?: number;

    constructor({ name, level, queueSizeLimit }: LoggerOptions = {}, options?: stream.TransformOptions) {
        super(new stream.PassThrough({
            ...Config.getDuplexDefaults(true, true),
            ...options, ...{
                readableObjectMode: true,
                writableObjectMode: true
            }
        }));
        this.level = level ?? SyslogLevel.WARN;
        this.name = name ?? '';
        this.queueSizeLimit = queueSizeLimit;
    }

    protected log(message: string, level: SyslogLevel) {
        try {
            const targetObject = { stack: '' };
            if (Config.captureStackTrace) {
                Error.captureStackTrace(targetObject, this.log);
            }
            const data = new LogRecord<string, SyslogLevelT>({
                message,
                name: this.name,
                depth: 2,
                level: <KeysUppercase<SyslogLevelT>>SyslogLevel[level],
                stack: targetObject.stack
            });
            super[$write](data);
            if (this.queueSizeLimit && this[$size] > this.queueSizeLimit) {
                throw new QueueSizeLimitExceededError(`The queue size limit, ${this.queueSizeLimit}, is exceeded.`);
            }
        }
        catch (err) {
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
            this.log(message, SyslogLevel.DEBUG);
        }
    }

    public info(message: string): void {
        if (this.level && this.level >= SyslogLevel.INFO) {
            this.log(message, SyslogLevel.INFO);
        }
    }

    public notice(message: string): void {
        if (this.level && this.level >= SyslogLevel.NOTICE) {
            this.log(message, SyslogLevel.NOTICE);
        }
    }

    public warn(message: string): void {
        if (this.level && this.level >= SyslogLevel.WARN) {
            this.log(message, SyslogLevel.WARN);
        }
    }

    public error(message: string): void {
        if (this.level && this.level >= SyslogLevel.ERROR) {
            this.log(message, SyslogLevel.ERROR);
        }
    }

    public crit(message: string): void {
        if (this.level && this.level >= SyslogLevel.CRIT) {
            this.log(message, SyslogLevel.CRIT);
        }
    }

    public alert(message: string): void {
        if (this.level && this.level >= SyslogLevel.ALERT) {
            this.log(message, SyslogLevel.ALERT);
        }
    }

    public emerg(message: string): void {
        if (this.level && this.level >= SyslogLevel.EMERG) {
            this.log(message, SyslogLevel.EMERG);
        }
    }

    public setLevel(level: SyslogLevel) {
        this.level = level;
    }
}