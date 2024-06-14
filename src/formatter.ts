import * as s from "node:stream";
import { LogRecord } from "./log_record";
import { Transform } from "./transform";
import { SyslogLevelT } from "./syslog";

export class Formatter extends Transform<LogRecord<string, SyslogLevelT>, string> {

    constructor(transform: (record: LogRecord<string, SyslogLevelT>) => Promise<string>) {
        super(new s.Transform({
            writableObjectMode: true, 
            readableObjectMode: false,
            transform: async (chunk: LogRecord<string, SyslogLevelT>, encoding: BufferEncoding, callback: s.TransformCallback)=>{
                const result = await transform(chunk);
                callback(null, result);
            }
        }));
    }
}