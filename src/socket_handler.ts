import * as node from '@farar/nodes';
import { LogRecord } from './log_record.js';
import { SyslogLevelT } from './syslog.js';

export class SocketHandler extends node.SocketHandler<LogRecord<string, SyslogLevelT>, LogRecord<string, SyslogLevelT>> {
    /* https://github.com/faranalytics/nodes/blob/main/src/commons/socket_handler.ts */
}