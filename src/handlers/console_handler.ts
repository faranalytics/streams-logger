import * as stream from 'node:stream';
import { once } from 'node:events';
import { Node } from '@farar/nodes';
import { LogContext } from '../commons/log_context.js';
import { SyslogLevel, SyslogLevelT } from '../commons/syslog.js';
import { Config } from '../index.js';

export const $level = Symbol('option');

export class ConsoleHandlerTransform<MessageT> extends stream.Transform {

    public [$level]: SyslogLevel;

    constructor(options: ConsoleHandlerOptions, streamOptions?: stream.WritableOptions) {
        super({
            ...Config.getWritableOptions(true),
            ...streamOptions,
            ...{ objectMode: true }
        });

        this[$level] = options.level ?? SyslogLevel.WARN;

        this.once('error', () => this.unpipe(process.stdout)).pipe(process.stdout);
    }

    public async _transform(logContext: LogContext<MessageT, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback): Promise<void> {
        try {
            if (SyslogLevel[logContext.level] > this[$level]) {
                callback();
                return;
            }

            const message: string | Buffer = (
                (typeof logContext.message == 'string' || logContext.message instanceof Buffer) ? logContext.message :
                    JSON.stringify(logContext.message)
            );

            if (SyslogLevel[logContext.level] > SyslogLevel.ERROR) {
                callback(null, message);
                return;
            }

            if (!process.stderr.write(message)) {
                await once(process.stderr, 'drain');
                callback();
                return;
            }

            callback();
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

    constructor(options: ConsoleHandlerOptions, streamOptions?: stream.WritableOptions) {
        super(new ConsoleHandlerTransform<MessageT>(options, streamOptions));
    }

    public setLevel(level: SyslogLevel): void {
        this._stream[$level] = level;
    }

    public get level(): SyslogLevel {
        return this._stream[$level];
    }
}
