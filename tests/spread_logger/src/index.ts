/* eslint-disable @typescript-eslint/no-unused-vars */
import { Formatter, ConsoleHandler, SyslogLevel } from "streams-logger";
import { SpreadLogger } from "./spread_logger.js";

for (let i = 0; i < 20; i++) {
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
}
