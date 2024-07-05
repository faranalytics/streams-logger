import * as node from '@farar/nodes';
import { LogRecord } from './log_record.js';
import { SyslogLevelT } from './syslog.js';

export class SocketHandler<T> extends node.SocketHandler<LogRecord<T, SyslogLevelT>, LogRecord<T, SyslogLevelT>> {
    /* https://github.com/faranalytics/nodes/blob/main/src/commons/socket_handler.ts */
}