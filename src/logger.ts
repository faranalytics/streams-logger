import * as s from "node:stream";
import { LogRecord } from "./log_record";
import { Transform } from "./transform";
import { SyslogLevel, SyslogLevelT } from "./syslog";
import { KeysUppercase } from "./types";


export interface LogData {
    message: string;
    name: string;
    level: KeysUppercase<SyslogLevelT>;
}

export async function transform(data: LogData): Promise<LogRecord<string, SyslogLevelT>> {
    const record = new LogRecord<string, SyslogLevelT>({...{ depth:10}, ...data});
    return record;
}

export interface LoggerOptions {
    level: SyslogLevel;
    name?: string;
}

export class Logger extends Transform<LogData, LogRecord<string, SyslogLevelT>> {

    public level: SyslogLevel;
    public name: string;

    constructor(options?: LoggerOptions) {
        super({ stream: new s.Transform({writableObjectMode: true, readableObjectMode:true}), transform });
        this.level = options?.level ?? SyslogLevel.WARN;
        this.name = options?.name ?? '';
    }

    public debug(message: string): void {
        if (this.level && this.level >= SyslogLevel.DEBUG) {
            this.write({message, name: this.name, level: 'DEBUG'});
        }
    }

    public info(message: string): void {
        if (this.level && this.level >= SyslogLevel.INFO) {
            this.write({message, name: this.name, level: 'INFO'});
        }
    }

    public notice(message: string): void {
        if (this.level && this.level >= SyslogLevel.NOTICE) {
            this.write({message, name: this.name, level: 'NOTICE'});
        }
    }

    public warn(message: string): void {
        if (this.level && this.level >= SyslogLevel.WARN) {
            this.write({message, name: this.name, level: 'WARN'});
        }
    }

    public error(message: string): void {
        if (this.level && this.level >= SyslogLevel.ERROR) {
            this.write({message, name: this.name, level: 'ERROR'});
        }
    }

    public crit(message: string): void {
        if (this.level && this.level >= SyslogLevel.CRIT) {
            this.write({message, name: this.name, level: 'CRIT'});
        }
    }

    public alert(message: string): void {
        if (this.level && this.level >= SyslogLevel.ALERT) {
            this.write({message, name: this.name, level: 'ALERT'});
        }
    }

    public emerg(message: string): void {
        if (this.level && this.level >= SyslogLevel.EMERG) {
            this.write({message, name: this.name, level: 'EMERG'});
        }
    }
}