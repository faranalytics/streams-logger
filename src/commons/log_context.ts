import * as pth from 'node:path';
import { KeysUppercase } from './types.js';
import { SyslogLevelT } from './syslog.js';

export interface LogContextConstructorOptions<MessageT = string, LevelT = SyslogLevelT> {
    message: MessageT;
    name?: string;
    level: KeysUppercase<LevelT>;
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
    hostname?: string;
    threadid?: number;
    metadata?: unknown;
    label?: string;
    regex?: string;
}

export class LogContext<MessageT, LevelT> implements LogContextConstructorOptions<MessageT, LevelT> {

    public message: MessageT;
    public name?: string;
    public level: KeysUppercase<LevelT>;
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
    public hostname?: string;
    public threadid?: number;
    public stack?: string;
    public metadata?: unknown;
    public label?: string;

    constructor(options: LogContextConstructorOptions<MessageT, LevelT>) {
        this.message = options.message;
        this.name = options.name;
        this.level = options.level;
        this.stack = options.stack;
        this.func = options.func;
        this.url = options.url;
        this.line = options.line;
        this.col = options.col;
        this.isotime = options.isotime;
        this.pathname = options.pathname;
        this.path = options.path;
        this.pathdir = options.pathdir;
        this.pathroot = options.pathroot;
        this.pathbase = options.pathbase;
        this.pathext = options.pathext;
        this.pid = options.pid;
        this.hostname = options.hostname;
        this.threadid = options.threadid;
        this.metadata = options.metadata;
        this.label = options.label;
    }

    public parseStackTrace(depth?: number) {
        if (this.stack) {
            const regex = (depth ?
                RegExp(`^${'[^\\n]*\\n'.repeat(depth)}\\s+at (?<func>[^\\s]+)?.*?(?<url>(?:file://|/)(?<path>[^:]+)):(?<line>\\d+):(?<col>\\d+)`, 'is') :
                /^[^\n]*\n[^\n]*\n\s+at (?<func>[^\s]+)?.*?(?<url>(?:file:\/\/|\/)(?<path>[^:]+)):(?<line>\d+):(?<col>\d+)/
            );
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