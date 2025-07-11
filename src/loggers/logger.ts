import * as os from "node:os";
import * as stream from "node:stream";
import * as threads from "node:worker_threads";
import Config from "../commons/config.js";
import { LogContext } from "../commons/log_context.js";
import { Node } from "@farar/nodes";
import { SyslogLevel, SyslogLevelT } from "../commons/syslog.js";
import { KeysUppercase } from "../commons/types.js";
import { QueueSizeLimitExceededError } from "../commons/errors.js";

export const $log = Symbol("log");

export interface BaseLoggerOptions<MessageT> {
  level?: SyslogLevel;
  name?: string;
  queueSizeLimit?: number;
  parent?: Logger<MessageT> | null;
  captureStackTrace?: boolean;
  captureISOTime?: boolean;
}

export abstract class BaseLogger<MessageT = string> extends Node<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>> {

  public level: SyslogLevel;
  protected _name?: string;
  protected _captureStackTrace: boolean;
  protected _captureISOTime: boolean;
  protected _queueSizeLimit?: number;

  constructor({ name, level, queueSizeLimit, parent, captureStackTrace, captureISOTime }: BaseLoggerOptions<MessageT>, streamOptions?: stream.TransformOptions) {
    super(new stream.PassThrough({
      ...Config.getDuplexOptions(true, true),
      ...streamOptions, ...{
        readableObjectMode: true,
        writableObjectMode: true
      }
    }));

    this.level = level ?? SyslogLevel.WARN;
    this._name = name;
    this._queueSizeLimit = queueSizeLimit;
    this._captureISOTime = captureISOTime ?? Config.captureISOTime;
    this._captureStackTrace = captureStackTrace ?? Config.captureStackTrace;
    if (parent !== null) {
      this.connect(parent ?? root);
    }
  }

  protected [$log](message: MessageT, label: string | undefined, level: SyslogLevel): void {
    try {
      const logContext = new LogContext<MessageT, SyslogLevelT>({
        message,
        name: this._name,
        level: SyslogLevel[level] as KeysUppercase<SyslogLevelT>,
        isotime: this._captureISOTime ? new Date().toISOString() : undefined,
        label: label,
        threadid: threads.threadId,
        pid: process.pid,
        hostname: os.hostname()
      });
      if (this._captureStackTrace) {
        Error.captureStackTrace(logContext.capture, this[$log]);
        logContext.parseStackTrace();
      }
      super._write(logContext).catch((err: unknown) => { Config.errorHandler(err instanceof Error ? err : new Error()); });
      if (this._queueSizeLimit && this._size > this._queueSizeLimit) {
        throw new QueueSizeLimitExceededError(`The queue size limit, ${this._queueSizeLimit.toString()}, is exceeded.`);
      }
    }
    catch (err) {
      if (err instanceof QueueSizeLimitExceededError) {
        throw err;
      }
      else {
        if (err instanceof Error) {
          Config.errorHandler(err);
        }
      }
    }
  };
}

export class Logger<MessageT = string> extends BaseLogger<MessageT> {

  public debug = (message: MessageT, label?: string): void => {
    if (this.level >= SyslogLevel.DEBUG) {
      this[$log](message, label, SyslogLevel.DEBUG);
    }
  };

  public info = (message: MessageT, label?: string): void => {
    if (this.level >= SyslogLevel.INFO) {
      this[$log](message, label, SyslogLevel.INFO);
    }
  };

  public notice = (message: MessageT, label?: string): void => {
    if (this.level >= SyslogLevel.NOTICE) {
      this[$log](message, label, SyslogLevel.NOTICE);
    }
  };

  public warn = (message: MessageT, label?: string): void => {
    if (this.level >= SyslogLevel.WARN) {
      this[$log](message, label, SyslogLevel.WARN);
    }
  };

  public error = (message: MessageT, label?: string): void => {
    if (this.level >= SyslogLevel.ERROR) {
      this[$log](message, label, SyslogLevel.ERROR);
    }
  };

  public crit = (message: MessageT, label?: string): void => {
    if (this.level >= SyslogLevel.CRIT) {
      this[$log](message, label, SyslogLevel.CRIT);
    }
  };

  public alert = (message: MessageT, label?: string): void => {
    if (this.level >= SyslogLevel.ALERT) {
      this[$log](message, label, SyslogLevel.ALERT);
    }
  };

  public emerg = (message: MessageT, label?: string): void => {
    if (this.level >= SyslogLevel.EMERG) {
      this[$log](message, label, SyslogLevel.EMERG);
    }
  };

  public setLevel = (level: SyslogLevel): void => {
    this.level = level;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const root = new Logger<any>({ name: "root", parent: null });