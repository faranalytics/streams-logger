import * as stream from 'node:stream';
import { Node } from '@farar/nodes';
import { LogContext } from '../commons/log_context.js';
import { SyslogLevel, SyslogLevelT } from '../commons/syslog.js';
import { Config } from '../index.js';

export const $level = Symbol('option');

export class ConsoleHandlerTransform<MessageT> extends stream.Transform {

    public [$level]!: SyslogLevel;

    constructor(streamOptions?: stream.WritableOptions) {
        super({
            ...Config.getWritableOptions(true),
            ...streamOptions,
            ...{ objectMode: true }
        });
        this.once('error', () => this.unpipe(process.stdout)).pipe(process.stdout);
    }

    public async _transform(logContext: LogContext<MessageT, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback): Promise<void> {
        try {
            if (SyslogLevel[logContext.level] <= this[$level]) {
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
                Config.errorHandler(err);
            }
        }
    }
}

export interface ConsoleHandlerOptions {
    level?: SyslogLevel;
}

export class ConsoleHandler<MessageT = string> extends Node<LogContext<MessageT, SyslogLevelT>, never, ConsoleHandlerTransform<MessageT>> {


    constructor({ level }: ConsoleHandlerOptions, streamOptions?: stream.WritableOptions) {
        super(new ConsoleHandlerTransform<MessageT>(streamOptions));
        this._stream[$level] = level ?? SyslogLevel.WARN;
    }

    public setLevel(level: SyslogLevel): void {
        this._stream[$level] = level;
    }
}
