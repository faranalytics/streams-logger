import * as stream from 'node:stream';
import * as threads from 'node:worker_threads';
import { LogContext } from '../commons/log_context.js';
import { Node, $write, $outs, $size } from '@farar/nodes';
import { SyslogLevel, SyslogLevelT } from '../commons/syslog.js';
import { KeysUppercase } from '../commons/types.js';
import { QueueSizeLimitExceededError } from '../commons/errors.js';
import { Config } from '../index.js';

export interface LoggerConstructorOptions<MessageT> {
    level?: SyslogLevel;
    name?: string;
    queueSizeLimit?: number;
    parent?: Logger<MessageT> | null;
    captureStackTrace?: boolean;
    captureISOTime?: boolean;
}

export class Logger<MessageT = string> extends Node<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>> {

    public option: Required<Pick<LoggerConstructorOptions<MessageT>, 'level'>> & Omit<LoggerConstructorOptions<MessageT>, 'level'>;

    constructor({ name, level, queueSizeLimit, parent, captureStackTrace, captureISOTime }: LoggerConstructorOptions<MessageT>, streamOptions?: stream.TransformOptions) {
        super(new stream.Transform({
            ...Config.getDuplexDefaults(true, true),
            ...streamOptions, ...{
                readableObjectMode: true,
                writableObjectMode: true,
                transform: (logContext: LogContext<string, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback) => {
                    if (this[$outs]?.length) {
                        callback(null, logContext);
                    }
                    else {
                        callback();
                    }
                }
            }
        }));
        this.option = {
            level: level ?? SyslogLevel.WARN,
            name,
            queueSizeLimit,
            captureISOTime: captureISOTime ?? true,
            captureStackTrace: captureStackTrace ?? true
        };
        if (parent !== null) {
            parent = parent ?? root;
            if (parent) {
                this.connect(parent);
            }
        }
    }

    protected log(message: MessageT, label: string | undefined, level: SyslogLevel): void {
        try {
            const logContext = new LogContext<MessageT, SyslogLevelT>({
                message,
                name: this.option.name,
                depth: 2,
                level: SyslogLevel[level] as KeysUppercase<SyslogLevelT>,
                isotime: Config.captureISOTime && this.option.captureISOTime ? new Date().toISOString() : undefined,
                label: label,
                threadid: threads.threadId,
                pid: process.pid,
                env: process.env
            });
            if (Config.captureStackTrace && this.option.captureStackTrace) {
                Error.captureStackTrace(logContext, this.log);
                logContext.parseStackTrace();
            }
            super[$write](logContext).catch(() => { /* */ });
            if (this.option.queueSizeLimit && this[$size] > this.option.queueSizeLimit) {
                throw new QueueSizeLimitExceededError(`The queue size limit, ${this.option.queueSizeLimit}, is exceeded.`);
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
        if (this.option.level >= SyslogLevel.DEBUG) {
            this.log(message, label, SyslogLevel.DEBUG);
        }
    }

    public info(message: MessageT, label?: string): void {
        if (this.option.level >= SyslogLevel.INFO) {
            this.log(message, label, SyslogLevel.INFO);
        }
    }

    public notice(message: MessageT, label?: string): void {
        if (this.option.level >= SyslogLevel.NOTICE) {
            this.log(message, label, SyslogLevel.NOTICE);
        }
    }

    public warn(message: MessageT, label?: string): void {
        if (this.option.level >= SyslogLevel.WARN) {
            this.log(message, label, SyslogLevel.WARN);
        }
    }

    public error(message: MessageT, label?: string): void {
        if (this.option.level >= SyslogLevel.ERROR) {
            this.log(message, label, SyslogLevel.ERROR);
        }
    }

    public crit(message: MessageT, label?: string): void {
        if (this.option.level >= SyslogLevel.CRIT) {
            this.log(message, label, SyslogLevel.CRIT);
        }
    }

    public alert(message: MessageT, label?: string): void {
        if (this.option.level >= SyslogLevel.ALERT) {
            this.log(message, label, SyslogLevel.ALERT);
        }
    }

    public emerg(message: MessageT, label?: string): void {
        if (this.option.level >= SyslogLevel.EMERG) {
            this.log(message, label, SyslogLevel.EMERG);
        }
    }

    public setLevel(level: SyslogLevel): void {
        this.option.level = level;
    }
}

// eslint-disable-next-line prefer-const, no-var, @typescript-eslint/no-explicit-any
export var root: Logger<any> = new Logger<any>({ name: 'root', parent: null });