import * as stream from 'node:stream';
import { LogContext } from '../commons/log_context.js';
import { Node, $write, $outs, $size } from '@farar/nodes';
import { SyslogLevel, SyslogLevelT } from '../commons/syslog.js';
import { KeysUppercase } from '../commons/types.js';
import { QueueSizeLimitExceededError } from '../commons/errors.js';
import { Config } from '../index.js';

export interface LoggerOptions<MessageT> {
    level?: SyslogLevel;
    name?: string;
    queueSizeLimit?: number;
    parent?: Logger<MessageT> | null;
    captureStackTrace?: boolean;
    captureISOTime?: boolean;
}

export class Logger<MessageT = string> extends Node<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>> {

    public level: SyslogLevel;
    public name: string;
    public captureStackTrace: boolean;
    public captureISOTime: boolean;
    public queueSizeLimit?: number;

    constructor({ name = '', level, queueSizeLimit, parent, captureStackTrace = true, captureISOTime = true }: LoggerOptions<MessageT>, streamOptions?: stream.TransformOptions) {
        super(new stream.Transform({
            ...Config.getDuplexDefaults(true, true),
            ...streamOptions, ...{
                readableObjectMode: true,
                writableObjectMode: true,
                transform: (chunk: LogContext<string, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback) => {
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
        this.captureISOTime = captureISOTime;

        if (parent !== null) {
            parent = parent ?? root;
            if (parent) {
                this.connect(parent);
            }
        }
    }

    protected log(message: MessageT, label: string | undefined, level: SyslogLevel): void {
        try {
            const isoTime = Config.captureISOTime && this.captureISOTime ? new Date().toISOString() : undefined;
            const targetObject = { stack: '' };
            if (Config.captureStackTrace && this.captureStackTrace) {
                Error.captureStackTrace(targetObject, this.log);
            }
            const data = new LogContext<MessageT, SyslogLevelT>({
                message,
                name: this.name,
                depth: 2,
                level: SyslogLevel[level] as KeysUppercase<SyslogLevelT>,
                stack: targetObject.stack,
                isotime: isoTime,
                label: label
            });
            super[$write](data).catch(() => { /* */ });
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

    public debug(message: MessageT, label?: string): void {
        if (this.level && this.level >= SyslogLevel.DEBUG) {
            this.log(message, label, SyslogLevel.DEBUG);
        }
    }

    public info(message: MessageT, label?: string): void {
        if (this.level && this.level >= SyslogLevel.INFO) {
            this.log(message, label, SyslogLevel.INFO);
        }
    }

    public notice(message: MessageT, label?: string): void {
        if (this.level && this.level >= SyslogLevel.NOTICE) {
            this.log(message, label, SyslogLevel.NOTICE);
        }
    }

    public warn(message: MessageT, label?: string): void {
        if (this.level && this.level >= SyslogLevel.WARN) {
            this.log(message, label, SyslogLevel.WARN);
        }
    }

    public error(message: MessageT, label?: string): void {
        if (this.level && this.level >= SyslogLevel.ERROR) {
            this.log(message, label, SyslogLevel.ERROR);
        }
    }

    public crit(message: MessageT, label?: string): void {
        if (this.level && this.level >= SyslogLevel.CRIT) {
            this.log(message, label, SyslogLevel.CRIT);
        }
    }

    public alert(message: MessageT, label?: string): void {
        if (this.level && this.level >= SyslogLevel.ALERT) {
            this.log(message, label, SyslogLevel.ALERT);
        }
    }

    public emerg(message: MessageT, label?: string): void {
        if (this.level && this.level >= SyslogLevel.EMERG) {
            this.log(message, label, SyslogLevel.EMERG);
        }
    }

    public setLevel(level: SyslogLevel): void {
        this.level = level;
    }
}

// eslint-disable-next-line prefer-const, no-var, @typescript-eslint/no-explicit-any
export var root: Logger<any> = new Logger<any>({ name: 'root', parent: null });