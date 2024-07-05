import * as stream from 'node:stream';
import { LogRecord } from './log_record.js';
import { Node, $write, $outs, $size } from '@farar/nodes';
import { SyslogLevel, SyslogLevelT } from './syslog.js';
import { KeysUppercase } from './types.js';
import { QueueSizeLimitExceededError } from './errors.js';
import { Config } from './index.js';

export interface LoggerOptions<T> {
    level?: SyslogLevel;
    name: string;
    queueSizeLimit?: number;
    parent?: Logger<T> | null;
    captureStackTrace?: boolean;
}

export class Logger<T> extends Node<LogRecord<T, SyslogLevelT>, LogRecord<T, SyslogLevelT>> {

    public level: SyslogLevel;
    public name: string;
    public captureStackTrace: boolean;
    public queueSizeLimit?: number;

    constructor({ name = '', level, queueSizeLimit, parent, captureStackTrace = true }: LoggerOptions<T>, streamOptions?: stream.TransformOptions) {
        super(new stream.Transform({
            ...Config.getDuplexDefaults(true, true),
            ...streamOptions, ...{
                readableObjectMode: true,
                writableObjectMode: true,
                transform: (chunk: LogRecord<string, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback) => {
                    if (this[$outs]?.length) {
                        callback(null, chunk);
                    }
                    else {
                        callback();
                    }
                }
            }
        }));
        this.level = level ?? SyslogLevel.WARN;
        this.name = name ?? '';
        this.queueSizeLimit = queueSizeLimit;
        this.captureStackTrace = captureStackTrace;

        if (parent !== null) {
            parent = parent ?? root;
            if (parent) {
                this.connect(parent);
            }
        }
    }

    protected log(message: T, level: SyslogLevel): void {
        try {
            const targetObject = { stack: '' };
            if (Config.captureStackTrace && this.captureStackTrace) {
                Error.captureStackTrace(targetObject, this.log);
            }
            const data = new LogRecord<T, SyslogLevelT>({
                message,
                name: this.name,
                depth: 2,
                level: <KeysUppercase<SyslogLevelT>>SyslogLevel[level],
                stack: targetObject.stack
            });
            super[$write](data).catch(() => { });
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

    public debug(message: T): void {
        if (this.level && this.level >= SyslogLevel.DEBUG) {
            this.log(message, SyslogLevel.DEBUG);
        }
    }

    public info(message: T): void {
        if (this.level && this.level >= SyslogLevel.INFO) {
            this.log(message, SyslogLevel.INFO);
        }
    }

    public notice(message: T): void {
        if (this.level && this.level >= SyslogLevel.NOTICE) {
            this.log(message, SyslogLevel.NOTICE);
        }
    }

    public warn(message: T): void {
        if (this.level && this.level >= SyslogLevel.WARN) {
            this.log(message, SyslogLevel.WARN);
        }
    }

    public error(message: T): void {
        if (this.level && this.level >= SyslogLevel.ERROR) {
            this.log(message, SyslogLevel.ERROR);
        }
    }

    public crit(message: T): void {
        if (this.level && this.level >= SyslogLevel.CRIT) {
            this.log(message, SyslogLevel.CRIT);
        }
    }

    public alert(message: T): void {
        if (this.level && this.level >= SyslogLevel.ALERT) {
            this.log(message, SyslogLevel.ALERT);
        }
    }

    public emerg(message: T): void {
        if (this.level && this.level >= SyslogLevel.EMERG) {
            this.log(message, SyslogLevel.EMERG);
        }
    }

    public setLevel(level: SyslogLevel): void {
        this.level = level;
    }
}

// eslint-disable-next-line prefer-const, no-var
export var root: Logger<any> = new Logger<any>({ name: 'root', parent: null });