/* eslint-disable quotes */
import * as pth from 'node:path';
import * as fsp from 'node:fs/promises';
import * as s from 'node:stream';
import { LogRecord } from './log_record.js';
import { Node, $stream } from '@farar/nodes';
import { SyslogLevel, SyslogLevelT } from './syslog.js';
import { Config } from "./index.js";

export const $level = Symbol('level');
export const $path = Symbol('path');
export const $rotations = Symbol('rotations');
export const $bytes = Symbol('bytes');
export const $encoding = Symbol('encoding');
export const $mode = Symbol('mode');
export const $mutex = Symbol('mutex');


export class RotatingFileHandlerWritable extends s.Writable {

    public [$level]: SyslogLevel;
    public [$path]: string;
    public [$rotations]: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    public [$bytes]: number;
    public [$encoding]: BufferEncoding;
    public [$mode]: number;
    private [$mutex]: Promise<void>;

    constructor({ level = SyslogLevel.WARN, path, rotations = 0, bytes = 1e6, encoding = 'utf8', mode = 0o666 }: RotatingFileHandlerOptions,
        writableOptions?: s.WritableOptions) {
        super({
            ...Config.getWritableDefaults(true),
            ...writableOptions, ...{ objectMode: true }
        });
        this[$path] = pth.resolve(pth.normalize(path));
        this[$rotations] = rotations;
        this[$bytes] = bytes;
        this[$encoding] = encoding;
        this[$mode] = mode;
        this[$mutex] = Promise.resolve();
        this[$level] = level;
    }

    async _write(chunk: LogRecord<string, SyslogLevelT>, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): Promise<void> {
        try {
            if (SyslogLevel[chunk.level] <= this[$level]) {
                await (this[$mutex] = (async () => {
                    await this[$mutex].catch((err) => console.error(err));
                    const message = Buffer.from(chunk.message, this[$encoding]);
                    try {
                        const stats = await fsp.stat(this[$path]);
                        if (stats.isFile()) {
                            if (stats.size + message.length > this[$bytes]) {
                                await this.rotate();
                            }
                            await fsp.appendFile(this[$path], message, { mode: this[$mode], flag: 'a' });
                        }
                        else {
                            console.error(`The path, ${this[$path]}, is not a file.`);
                        }
                    }
                    catch (err) {
                        await fsp.appendFile(this[$path], message, { mode: this[$mode], flag: 'a' });
                    }
                })());
            }
        }
        catch (err) {
            console.error(err);
        }
        finally {
            callback();
        }
    }

    protected async rotate() {
        if (this[$rotations] === 0) {
            await fsp.rm(this[$path]);
        }
        else {
            for (let i = this[$rotations] - 1; i >= 0; i--) {
                let path;
                if (i == 0) {
                    path = this[$path];
                }
                else {
                    path = `${this[$path]}.${i} `;
                }
                try {
                    const stats = await fsp.stat(path);
                    if (stats.isFile()) {
                        await fsp.rename(path, `${this[$path]}.${i + 1} `);
                    }
                }
                catch (e) { /* flow-control */ }
            }
        }
    }
}

export interface RotatingFileHandlerOptions {
    path: string;
    rotations?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    bytes?: number;
    encoding?: BufferEncoding;
    mode?: number;
    level?: SyslogLevel;
}

export class RotatingFileHandler extends Node<LogRecord<string, SyslogLevelT>, never> {

    constructor(options: RotatingFileHandlerOptions, streamOptions?: s.WritableOptions) {
        super(new RotatingFileHandlerWritable(options, streamOptions));
    }

    public setLevel(level: SyslogLevel) {
        if (this[$stream] instanceof RotatingFileHandlerWritable) {
            this[$stream][$level] = level;
        }
    }
}