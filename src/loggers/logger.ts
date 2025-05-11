import { SyslogLevel } from "../commons/syslog.js";
import { BaseLogger } from "./base_logger.js";

export interface LoggerOptions<MessageT> {
  level?: SyslogLevel;
  name?: string;
  queueSizeLimit?: number;
  parent?: Logger<MessageT> | null;
  captureStackTrace?: boolean;
  captureISOTime?: boolean;
}

export class Logger<MessageT = string> extends BaseLogger <MessageT> {

  public debug = (message: MessageT, label?: string): void => {
    if (this.level >= SyslogLevel.DEBUG) {
      this.log(message, label, SyslogLevel.DEBUG);
    }
  };

  public info = (message: MessageT, label?: string): void => {
    if (this.level >= SyslogLevel.INFO) {
      this.log(message, label, SyslogLevel.INFO);
    }
  };

  public notice = (message: MessageT, label?: string): void => {
    if (this.level >= SyslogLevel.NOTICE) {
      this.log(message, label, SyslogLevel.NOTICE);
    }
  };

  public warn = (message: MessageT, label?: string): void => {
    if (this.level >= SyslogLevel.WARN) {
      this.log(message, label, SyslogLevel.WARN);
    }
  };

  public error = (message: MessageT, label?: string): void => {
    if (this.level >= SyslogLevel.ERROR) {
      this.log(message, label, SyslogLevel.ERROR);
    }
  };

  public crit = (message: MessageT, label?: string): void => {
    if (this.level >= SyslogLevel.CRIT) {
      this.log(message, label, SyslogLevel.CRIT);
    }
  };

  public alert = (message: MessageT, label?: string): void => {
    if (this.level >= SyslogLevel.ALERT) {
      this.log(message, label, SyslogLevel.ALERT);
    }
  };

  public emerg = (message: MessageT, label?: string): void => {
    if (this.level >= SyslogLevel.EMERG) {
      this.log(message, label, SyslogLevel.EMERG);
    }
  };

  public setLevel = (level: SyslogLevel): void => {
    this.level = level;
  };
}