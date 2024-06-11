import { KeysUppercase } from "./types";

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

    private error: Error;
    private depth: number;
    private regex: RegExp;
    
    constructor({ message, name, level, depth, error }: LogRecordOptions<MessageT, LevelT>) {
        this.message = message;
        this.name = name;
        this.level = level;
        this.depth = depth;
        this.error = error;
        this.regex = new RegExp(`^${'.*?\\n'.repeat(this.depth)}\\s+at(?: (?<func>[^\\s]+) \\(| )(?<url>[^\\n]+):(?<line>\\d+):(?<col>\\d+)`, 'is');
        const match = this.error.stack?.match(this.regex);
        const groups = match?.groups;
        if (groups) {
            this.func = groups['func'];
            this.url = groups['url'];
            this.line = groups['line'];
            this.col = groups['col'];
        }
    }
}
