import { BaseLogger, SyslogLevel, $log } from "streams-logger";

export class SpreadLogger<MessageT extends unknown[]> extends BaseLogger<MessageT> {
  private _label?: string;
  private _defaultLevel: SyslogLevel = SyslogLevel.DEBUG;

  public log = (...messages: MessageT): void => {
    if (this.level >= this._defaultLevel) {
      this[$log](messages, this._label ?? "", this._defaultLevel);
    }
  };

  public debug = (...messages: MessageT): void => {
    if (this.level >= SyslogLevel.DEBUG) {
      this[$log](messages, this._label ?? "", SyslogLevel.DEBUG);
    }
  };

  public info = (...messages: MessageT): void => {
    if (this.level >= SyslogLevel.INFO) {
      this[$log](messages, this._label ?? "", SyslogLevel.INFO);
    }
  };

  public notice = (...messages: MessageT): void => {
    if (this.level >= SyslogLevel.NOTICE) {
      this[$log](messages, this._label ?? "", SyslogLevel.NOTICE);
    }
  };

  public warn = (...messages: MessageT): void => {
    if (this.level >= SyslogLevel.WARN) {
      this[$log](messages, this._label ?? "", SyslogLevel.WARN);
    }
  };

  public error = (...messages: MessageT): void => {
    if (this.level >= SyslogLevel.ERROR) {
      this[$log](messages, this._label ?? "", SyslogLevel.ERROR);
    }
  };

  public crit = (...messages: MessageT): void => {
    if (this.level >= SyslogLevel.CRIT) {
      this[$log](messages, this._label ?? "", SyslogLevel.CRIT);
    }
  };

  public alert = (...messages: MessageT): void => {
    if (this.level >= SyslogLevel.ALERT) {
      this[$log](messages, this._label ?? "", SyslogLevel.ALERT);
    }
  };

  public emerg = (...messages: MessageT): void => {
    if (this.level >= SyslogLevel.EMERG) {
      this[$log](messages, this._label ?? "", SyslogLevel.EMERG);
    }
  };

  public setLevel = (level: SyslogLevel): void => {
    this.level = level;
  };

  public setDefaultLevel = (level: SyslogLevel): void => {
    this._defaultLevel = level;
  };

  public setLabel = (label: string): void => {
    this._label = label;
  };
}