import { Formatter, ConsoleHandler, BaseLogger, SyslogLevel } from "streams-logger";

export class SpreadLogger<MessageT extends unknown[]> extends BaseLogger<MessageT> {
  public _label?: string;

  public debug = (...messages: MessageT): void => {
    if (this.level >= SyslogLevel.DEBUG) {
      this.log(messages, this._label ?? "", SyslogLevel.DEBUG);
    }
  };

  public info = (...messages: MessageT): void => {
    if (this.level >= SyslogLevel.INFO) {
      this.log(messages, this._label ?? "", SyslogLevel.INFO);
    }
  };

  public notice = (...messages: MessageT): void => {
    if (this.level >= SyslogLevel.NOTICE) {
      this.log(messages, this._label ?? "", SyslogLevel.NOTICE);
    }
  };

  public warn = (...messages: MessageT): void => {
    if (this.level >= SyslogLevel.WARN) {
      this.log(messages, this._label ?? "", SyslogLevel.WARN);
    }
  };

  public error = (...messages: MessageT): void => {
    if (this.level >= SyslogLevel.ERROR) {
      this.log(messages, this._label ?? "", SyslogLevel.ERROR);
    }
  };

  public crit = (...messages: MessageT): void => {
    if (this.level >= SyslogLevel.CRIT) {
      this.log(messages, this._label ?? "", SyslogLevel.CRIT);
    }
  };

  public alert = (...messages: MessageT): void => {
    if (this.level >= SyslogLevel.ALERT) {
      this.log(messages, this._label ?? "", SyslogLevel.ALERT);
    }
  };

  public emerg = (...messages: MessageT): void => {
    if (this.level >= SyslogLevel.EMERG) {
      this.log(messages, this._label ?? "", SyslogLevel.EMERG);
    }
  };

  public setLevel = (level: SyslogLevel): void => {
    this.level = level;
  };

  public setLabel = (label: string): void => {
    this._label = label;
  };
}

const logger = new SpreadLogger<[string, object]>({ level: SyslogLevel.DEBUG });
const consoleFormatter = new Formatter<[string, object], string>({
  format: ({ level, isotime, hostname, pid, func, message, }) => (
    `<${level}> ${isotime ?? ""} ${hostname ?? ""} ${pid?.toString() ?? ""} - ${func ?? ""} ${message[0]}:${JSON.stringify(message[1])}\n`
  )
});
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

const log = logger.connect(
  consoleFormatter.connect(
    consoleHandler
  )
);

function sayHello() {
  for (let i = 0; i < 1e0; i++) {
    log.debug("Label", { greeting: "Hello, World!" });
  }
}

setInterval(sayHello, 1000);

log.debug("Label", { greeting: "Hello, World!" });

(function sayHello() {
  log.debug("Label", { greeting: "Hello, World!" });
})();