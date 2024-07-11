import * as pth from 'node:path';
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import * as stream from 'node:stream';
import { LogContext } from '../commons/log_context.js';
import { Node, $stream } from '@farar/nodes';
import { SyslogLevel, SyslogLevelT } from '../commons/syslog.js';
import { Config } from '../index.js';

const $rotate = Symbol('rotate');
const $option = Symbol('option');
const $path = Symbol('path');
const $writeStream = Symbol('writeStream');
const $size = Symbol('size');

export class RotatingFileHandlerTransform<MessageT> extends stream.Transform {

    public [$option]: Required<Omit<RotatingFileHandlerConstructorOptions, 'path'>>;
    protected [$path]: string;
    protected [$writeStream]: fs.WriteStream;
    protected [$size]: number;

    constructor({ level, path, rotationCount, maxSize = 1e6, encoding, mode }: RotatingFileHandlerConstructorOptions, writableOptions?: stream.WritableOptions) {
        super({
            ...Config.getWritableDefaults(true),
            ...writableOptions, ...{ objectMode: true }
        });
        this.propagateError = this.propagateError.bind(this);
        this[$option] = {
            level: level ?? SyslogLevel.WARN,
            rotationCount: rotationCount ?? 0,
            maxSize: maxSize ?? 1e6,
            encoding: encoding ?? 'utf8',
            mode: mode ?? 0o666
        };
        this[$path] = pth.resolve(pth.normalize(path));
        this[$size] = 0;
        if (fs.existsSync(this[$path])) {
            this[$size] = fs.statSync(this[$path]).size;
        }
        this[$writeStream] = fs.createWriteStream(path, { mode, encoding });
        this.once('error', () => {
            this.unpipe(this[$writeStream]);
            this[$writeStream].close();
        });
        this[$writeStream].once('error', this.propagateError);
        this.pipe(this[$writeStream]);
    }

    protected propagateError(err: Error) {
        this.emit('error', err);
    }

    public async _transform(logContext: LogContext<MessageT, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback): Promise<void> {
        try {
            const message: Buffer = (
                logContext.message instanceof Buffer ? logContext.message :
                    typeof logContext.message == 'string' ? Buffer.from(logContext.message, this[$option].encoding) :
                        Buffer.from(JSON.stringify(logContext.message), this[$option].encoding)
            );
            if (this[$size] + message.length > this[$option].maxSize) {
                await this[$rotate]();
            }
            this[$size] = this[$size] + message.length;
            callback(null, message);
        }
        catch (err) {
            if (err instanceof Error) {
                callback(err);
            }
        }
    }

    protected async [$rotate]() {
        this.unpipe(this[$writeStream]);
        this[$writeStream].close();
        this[$writeStream].removeListener('error', this.propagateError);
        if (this[$option].rotationCount === 0) {
            await fsp.rm(this[$path]);
        }
        else {
            for (let i = this[$option].rotationCount - 1; i >= 0; i--) {
                let path;
                if (i == 0) {
                    path = this[$path];
                }
                else {
                    path = `${this[$path]}.${i}`;
                }
                try {
                    const stats = await fsp.stat(path);
                    if (stats.isFile()) {
                        await fsp.rename(path, `${this[$path]}.${i + 1}`);
                    }
                }
                catch (e) { /* flow-control */ }
            }
        }
        this[$writeStream] = fs.createWriteStream(this[$path], { mode: this[$option].mode, encoding: this[$option].encoding });
        this[$writeStream].once('error', (err: Error) => this.emit('error', err));
        this.pipe(this[$writeStream]);
        this[$size] = 0;
    }
}

export interface RotatingFileHandlerConstructorOptions {
    path: string;
    rotationCount?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    maxSize?: number;
    encoding?: BufferEncoding;
    mode?: number;
    level?: SyslogLevel;
}

export class RotatingFileHandler<MessageT = string> extends Node<LogContext<MessageT, SyslogLevelT>, never> {

    public option: Required<Omit<RotatingFileHandlerConstructorOptions, 'path'>>;

    constructor(options: RotatingFileHandlerConstructorOptions, streamOptions?: stream.WritableOptions) {
        const rotatingFileHandlerTransform = new RotatingFileHandlerTransform<MessageT>(options, streamOptions);
        super(rotatingFileHandlerTransform);
        this.option = rotatingFileHandlerTransform[$option];
    }

    public setLevel(level: SyslogLevel) {
        if (this[$stream] instanceof RotatingFileHandlerTransform) {
            this[$stream][$option].level = level;
        }
    }
}