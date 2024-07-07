import * as node from '@farar/nodes';
import { LogContext } from '../commons/log_context.js';
import { SyslogLevelT } from '../commons/syslog.js';

export class SocketHandler<MessageT = string> extends node.SocketHandler<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>> {
    /* https://github.com/faranalytics/nodes/blob/main/src/commons/socket_handler.ts */


    protected deserializeMessage(data: Buffer): LogContext<MessageT, SyslogLevelT> {
        return new LogContext(<LogContext<MessageT, SyslogLevelT>>JSON.parse(data.toString('utf-8'), this.reviver));
    }
}