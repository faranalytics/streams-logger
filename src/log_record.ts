export interface LogRecordOptions {
    message: string;
    name: string;
    level: unknown;
    depth: number;
}

export class LogRecord {
    public message: string;
    public name: string;
    public level: unknown;
    public error?: Error;
    public func?: string;
    public url?: string;
    public line?: string;
    public col?: string;

    private depth: number;
    private regex: RegExp;
    
    constructor({ message, name, level, depth }: LogRecordOptions) {
        this.message = message;
        this.name = name;
        this.level = level;
        this.depth = depth;
        this.regex = new RegExp(`^${'.*?\\n'.repeat(this.depth)}\\s+at(?: (?<func>[^\\s]+) \\(| )(?<url>[^\\n]+):(?<line>\\d+):(?<col>\\d+)`, 'is');

        const error = new Error();
        const match = error.stack?.match(this.regex);

        const groups = match?.groups;

        if (groups) {
            this.func = groups['func'];
            this.url = groups['url'];
            this.line = groups['line'];
            this.col = groups['col'];
        }
    }
}
