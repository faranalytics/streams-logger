/* eslint-disable quotes */
import * as pth from 'node:path';
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import * as stream from 'node:stream';
import { LogContext } from '../commons/log_context.js';
import { Node, $stream } from '@farar/nodes';
import { SyslogLevel, SyslogLevelT } from '../commons/syslog.js';
import { Config } from "../index.js";

export class RotatingFileHandlerTransform<MessageT> extends stream.Transform {

    public level: SyslogLevel;
    public path: string;
    public rotationCount: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    public maxSize: number;
    public encoding: BufferEncoding;
    public mode: number;
    public fsStream: fs.WriteStream;
    public size: number;

    constructor({ level, path, rotationCount, maxSize, encoding, mode }: RotatingFileHandlerConstructorOptions, writableOptions?: stream.WritableOptions) {
        super({
            ...Config.getWritableDefaults(true),
            ...writableOptions, ...{ objectMode: true }
        });
        this.path = pth.resolve(pth.normalize(path));
        this.rotationCount = rotationCount ?? 0;
        this.maxSize = maxSize ?? 1e6;
        this.encoding = encoding ?? 'utf8';
        this.mode = mode ?? 0o666;
        this.level = level ?? SyslogLevel.WARN;
        this.size = 0;

        if(fs.existsSync(this.path)){
            this.size = fs.statSync(this.path).size;
        }

        this.fsStream = fs.createWriteStream(path, { mode, encoding });

        this.once('error', () => {
            this.unpipe(this.fsStream);
        }).pipe(this.fsStream);
    }

    async _transform(chunk: LogContext<MessageT, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback): Promise<void> {
        try {
            const message: Buffer = (
                chunk.message instanceof Buffer ? chunk.message :
                    typeof chunk.message == 'string' ? Buffer.from(chunk.message, this.encoding) :
                        Buffer.from(JSON.stringify(chunk.message), this.encoding)
            );
            if (this.size + message.length > this.maxSize) {
                await this.rotate();
            }
            this.size = this.size + message.length;
            callback(null, message);
        }
        catch (err) {
            if (err instanceof Error) {
                callback(err);
            }
        }
    }

    protected async rotate() {
        this.unpipe(this.fsStream);
        this.fsStream.close();
        if (this.rotationCount === 0) {
            await fsp.rm(this.path);
        }
        else {
            for (let i = this.rotationCount - 1; i >= 0; i--) {
                let path;
                if (i == 0) {
                    path = this.path;
                }
                else {
                    path = `${this.path}.${i} `;
                }
                try {
                    const stats = await fsp.stat(path);
                    if (stats.isFile()) {
                        await fsp.rename(path, `${this.path}.${i + 1} `);
                    }
                }
                catch (e) { /* flow-control */ }
            }
        }
        this.fsStream = fs.createWriteStream(this.path, { mode: this.mode, encoding: this.encoding });
        this.once('error', () => this.unpipe(this.fsStream)).pipe(this.fsStream);
        this.size = 0;
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

    constructor(options: RotatingFileHandlerConstructorOptions, streamOptions?: stream.WritableOptions) {
        super(new RotatingFileHandlerTransform<MessageT>(options, streamOptions));
    }

    public setLevel(level: SyslogLevel) {
        if (this[$stream] instanceof RotatingFileHandlerTransform) {
            this[$stream].level = level;
        }
    }
}