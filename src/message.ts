import { Levels } from "./levels.js";

export interface MessageOptions<T extends Levels> {
    message:string;
    name: string;
    level: T;
}

export class Message<T extends Levels> {
    public message: string;
    public name: string;
    public level: T;
    public error?: Error;
    public func?: string;
    public url?: string;
    public line?: string;
    public col?: string;

    constructor({ message, name, level }: MessageOptions<T>) {
        this.message = message;
        this.name = name;
        this.level = level;

        const error = new Error();
        const match = error.stack?.match(/^.*(at LevelLogger[^\n]+?\n)\s+at(?: (?<func>[^\s]+) \(| )(?<url>[^\n]+):(?<line>\d+):(?<col>\d+)/is);
        const groups = match?.groups;

        if (groups) {
            this.func = groups['func'];
            this.url = groups['url'];
            this.line = groups['line'];
            this.col = groups['col'];
        }
    }
}
