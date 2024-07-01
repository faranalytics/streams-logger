import * as graph_transform from 'graph-transform';
import { LogRecord } from './log_record.js';
import { SyslogLevelT } from './syslog.js';

export class SocketHandler extends graph_transform.SocketHandler<LogRecord<string, SyslogLevelT>, LogRecord<string, SyslogLevelT>> { }