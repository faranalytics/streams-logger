import { Logger, Formatter, ConsoleHandler, SyslogLevel } from "streams-logger";

const logger = new Logger({ level: SyslogLevel.DEBUG });
const consoleFormatter = new Formatter({
  format: ({ level, isotime, hostname, pid, func, message, }) => (
    `<${level}> ${isotime ?? ""} ${hostname ?? ""} ${pid?.toString() ?? ""} - ${func ?? ""} ${message}\n`
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
    log.debug("Hello, World!");
  }
}

setInterval(sayHello, 1000);

log.debug("Hello, World!");

(function sayHello() {
  log.debug("Hello, World!");
})();