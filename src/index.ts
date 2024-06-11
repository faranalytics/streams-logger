import { LogRecord } from "./log_record";
import { Transform } from "./transform";
import { Logger, LogData } from "./logger";
import {SyslogLevel, SyslogLevelT} from "./syslog";
import { Formatter } from "./formatter";
import { ConsoleHandler } from "./console_handler";

export {
    Transform,
    LogRecord,
    LogData,
    Logger,
    SyslogLevel,
    SyslogLevelT,
    Formatter,
    ConsoleHandler,
}

Error.stackTraceLimit = Infinity;