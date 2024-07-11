import * as stream from 'node:stream';
import { Node, $stream } from '@farar/nodes';
import { LogContext } from '../commons/log_context.js';
import { SyslogLevel, SyslogLevelT } from '../commons/syslog.js';
import { Config } from '../index.js';

const $option = Symbol('option');

export interface ConsoleHandlerWritableOptions {
    level: SyslogLevel;
}

export class ConsoleHandlerWritable<MessageT> extends stream.Transform {

    public [$option]: ConsoleHandlerWritableOptions;

    constructor({ level }: ConsoleHandlerConstructorOptions, streamOptions?: stream.WritableOptions) {
        super({
            ...Config.getWritableDefaults(true),
            ...streamOptions,
            ...{ objectMode: true }
        });
        this[$option] = {
            level: level ?? SyslogLevel.WARN
        };
        this.once('error', () => this.unpipe(process.stdout)).pipe(process.stdout);
    }

    public async _transform(logContext: LogContext<MessageT, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback): Promise<void> {
        try {
            if (SyslogLevel[logContext.level] <= this[$option].level) {
                const message: string | Buffer = (
                    (typeof logContext.message == 'string' || logContext.message instanceof Buffer) ? logContext.message :
                        JSON.stringify(logContext.message)
                );
                callback(null, message);
            }
            else {
                callback();
            }
        }
        catch (err) {
            if (err instanceof Error) {
                callback(err);
            }
        }
    }
}

export interface ConsoleHandlerConstructorOptions {
    level?: SyslogLevel;
}

export class ConsoleHandler<MessageT = string> extends Node<LogContext<MessageT, SyslogLevelT>, never> {

    public option: ConsoleHandlerWritableOptions;

    constructor(options: ConsoleHandlerConstructorOptions, streamOptions?: stream.WritableOptions) {
        const consoleHandlerWritable = new ConsoleHandlerWritable<MessageT>(options, streamOptions);
        super(consoleHandlerWritable);
        this.option = consoleHandlerWritable[$option];
    }

    public setLevel(level: SyslogLevel): void {
        if (this[$stream] instanceof ConsoleHandlerWritable) {
            this[$stream][$option].level = level;
        }
    }
}
