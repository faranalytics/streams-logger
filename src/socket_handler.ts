import * as node from '@farar/nodes';
import { LogContext } from './log_context.js';
import { SyslogLevelT } from './syslog.js';

export class SocketHandler<MessageT = string> extends node.SocketHandler<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>> {
    /* https://github.com/faranalytics/nodes/blob/main/src/commons/socket_handler.ts */
}