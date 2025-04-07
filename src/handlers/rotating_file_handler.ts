import * as pth from 'node:path';
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import * as stream from 'node:stream';
import { once } from 'node:events';
import { LogContext } from '../commons/log_context.js';
import { Node } from '@farar/nodes';
import { SyslogLevel, SyslogLevelT } from '../commons/syslog.js';
import { Config } from '../index.js';

export const $rotate = Symbol('rotate');
export const $option = Symbol('option');
export const $path = Symbol('path');
export const $writeStream = Symbol('writeStream');
export const $size = Symbol('size');
export const $level = Symbol('level');
export const $rotationLimit = Symbol('rotationLimit');
export const $maxSize = Symbol('maxSize');
export const $encoding = Symbol('encoding');
export const $mode = Symbol('mode');

export class RotatingFileHandlerTransform<MessageT> extends stream.Transform {

    protected [$path]: string;
    protected [$writeStream]: fs.WriteStream;
    protected [$size]: number;
    protected [$level]: SyslogLevel;
    protected [$rotationLimit]: number;
    protected [$maxSize]: number;
    protected [$mode]: number;
    protected [$encoding]: NodeJS.BufferEncoding;

    constructor({ level, path, rotationLimit, maxSize = 1e6, flags = 'a', encoding, mode }: RotatingFileHandlerOptions, writableOptions?: stream.WritableOptions) {
        super({
            ...Config.getWritableOptions(true),
            ...writableOptions, ...{ objectMode: true }
        });
        this[$level] = level ?? SyslogLevel.WARN;
        this[$rotationLimit] = rotationLimit ?? 0;
        this[$maxSize] = maxSize ?? 1e6;
        this[$encoding] = encoding ?? 'utf-8';
        this[$mode] = mode ?? 0o666;
        this[$path] = pth.resolve(pth.normalize(path));
        this[$size] = 0;

        if (fs.existsSync(this[$path])) {
            this[$size] = fs.statSync(this[$path]).size;
        }

        this.cork();
        this[$writeStream] = fs.createWriteStream(this[$path], { mode, encoding, flush: true, autoClose: true, flags: flags });
        this.pipe(this[$writeStream]);
        once(this[$writeStream], 'ready').then(() => { this.uncork(); }).catch(Config.errorHandler);

        this.once('error', () => {
            this[$writeStream].close();
        });
    }

    public async _transform(logContext: LogContext<MessageT, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback): Promise<void> {
        try {
            if (this[$writeStream].closed) {
                callback(this[$writeStream].errored ? this[$writeStream].errored : new Error('The `WriteStream` closed.'));
                return;
            }
            const message: Buffer = (
                logContext.message instanceof Buffer ? logContext.message :
                    typeof logContext.message == 'string' ? Buffer.from(logContext.message, this[$encoding]) :
                        Buffer.from(JSON.stringify(logContext.message), this[$encoding])
            );
            if (this[$size] + message.length > this[$maxSize]) {
                await this[$rotate]();
            }
            this[$size] = this[$size] + message.length;
            callback(null, message);
        }
        catch (err) {
            if (err instanceof Error) {
                callback(err);
                Config.errorHandler(err);
            }
        }
    }

    protected async [$rotate]() {
        this.unpipe(this[$writeStream]);
        this[$writeStream].close();
        if (this[$rotationLimit] === 0) {
            await fsp.rm(this[$path]);
        }
        else {
            for (let i = this[$rotationLimit] - 1; i >= 0; i--) {
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
        this.cork();
        this[$writeStream] = fs.createWriteStream(this[$path], { mode: this[$mode], encoding: this[$encoding] });
        this.pipe(this[$writeStream]);
        once(this[$writeStream], 'ready').then(() => { this.uncork(); }).catch(Config.errorHandler);
        this[$size] = 0;
    }
}

export interface RotatingFileHandlerOptions {
    path: string;
    rotationLimit?: number;
    maxSize?: number;
    encoding?: BufferEncoding;
    mode?: number;
    level?: SyslogLevel;
    flags?: string;
}

export class RotatingFileHandler<MessageT = string> extends Node<LogContext<MessageT, SyslogLevelT>, never, RotatingFileHandlerTransform<MessageT>> {

    constructor(options: RotatingFileHandlerOptions, streamOptions?: stream.WritableOptions) {
        super(new RotatingFileHandlerTransform<MessageT>(options, streamOptions));
    }

    public setLevel = (level: SyslogLevel): void => {
        this._stream[$level] = level;
    };

    public get level(): SyslogLevel {
        return this._stream[$level];
    }
}