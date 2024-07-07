/* eslint-disable @typescript-eslint/no-inferrable-types */
import * as pth from 'node:path';
import * as threads from 'node:worker_threads';
import { KeysUppercase } from './types.js';
import { SyslogLevelT } from './syslog.js';

export interface LogContextConstructorOptions<MessageT = string, LevelT = SyslogLevelT> {
    message?: MessageT;
    name?: string;
    level?: KeysUppercase<LevelT>;
    depth?: number;
    stack?: string;
    func?: string;
    url?: string;
    line?: string;
    col?: string;
    isotime?: string;
    pathname?: string;
    path?: string;
    pathdir?: string;
    pathroot?: string;
    pathbase?: string;
    pathext?: string;
    pid?: number;
    env?: NodeJS.ProcessEnv;
    threadid?: number;
    metadata?: unknown;
    label?: string;
    regex?: string;
}

export class LogContext<MessageT, LevelT> implements LogContextConstructorOptions<MessageT, LevelT> {
    public message?: MessageT;
    public name?: string;
    public level?: KeysUppercase<LevelT>;
    public func?: string;
    public url?: string;
    public line?: string;
    public col?: string;
    public isotime?: string;
    public pathname?: string;
    public path?: string;
    public pathdir?: string;
    public pathroot?: string;
    public pathbase?: string;
    public pathext?: string;
    public pid?: number;
    public env?: NodeJS.ProcessEnv = {};
    public threadid?: number;
    public stack?: string;
    public depth?: number;
    public metadata?: unknown;
    public label?: string;
    public regex?: string;

    constructor(options: LogContextConstructorOptions<MessageT, LevelT>) {
        Object.assign(this, options);
        this.threadid = options.threadid ?? threads.threadId;
        this.pid = options.pid ?? process.pid;
        this.env = options.env ?? process.env;
        if (!this.regex && this.stack && this.depth) {
            this.regex = `^${'[^\\n]*\\n'.repeat(this.depth)}\\s+at (?<func>[^\\s]+)?.*?(?<url>file://(?<path>[^:]+)):(?<line>\\d+):(?<col>\\d+)`;
            const regex = new RegExp(this.regex, 'is');
            const match = this.stack?.match(regex);
            const groups = match?.groups;
            if (groups) {
                this.func = groups['func'];
                this.url = groups['url'];
                this.line = groups['line'];
                this.col = groups['col'];
                this.path = groups['path'];
                const path = pth.parse(this.path);
                this.pathdir = path.dir;
                this.pathroot = path.root;
                this.pathbase = path.base;
                this.pathname = path.name;
                this.pathext = path.ext;
            }
        }
    }
}
