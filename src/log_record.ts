import * as pth from 'node:path';
import * as threads from 'node:worker_threads';
import { KeysUppercase } from './types.js';

export interface LogRecordOptions<MessageT, LevelT> {
    message: MessageT;
    name: string;
    level: KeysUppercase<LevelT>;
    depth: number;
    error: Error;
}

export class LogRecord<MessageT, LevelT> {
    public message: MessageT;
    public name: string;
    public level: KeysUppercase<LevelT>;
    public func?: string;
    public url?: string;
    public line?: string;
    public col?: string;
    public isotime: string;
    public pathname?: string;
    public path?: string;
    public pathdir?: string;
    public pathroot?: string;
    public pathbase?: string;
    public pathext?: string;
    public pid: string;
    public env: NodeJS.ProcessEnv;
    public threadid: string;

    private error: Error;
    private depth: number;
    private regex: RegExp;

    constructor({ message, name, level, depth, error }: LogRecordOptions<MessageT, LevelT>) {
        this.isotime = new Date().toISOString();
        this.message = message;
        this.name = name;
        this.level = level;
        this.pid = process.pid.toString();
        this.env = process.env;
        this.depth = depth;
        this.error = error;
        this.threadid = threads.threadId?.toString() ?? '';
        this.regex = new RegExp(`^${'[^\\n]*\\n'.repeat(this.depth)}\\s+at (?<func>[^\\s]+)?(?: \\()?(?<url>file://(?<path>[^:]+)):(?<line>\\d+):(?<col>\\d+)\\)?`, 'is');
        const match = this.error.stack?.match(this.regex);
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
