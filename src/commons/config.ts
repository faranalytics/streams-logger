import * as stream from 'node:stream';
import { EventEmitter } from 'node:events';

export type ErrorHandler = (err: Error, ...params: Array<unknown>) => void;

class Config extends EventEmitter {

    protected _highWaterMark?: number;
    protected _highWaterMarkObjectMode?: number;
    protected _captureStackTrace: boolean;
    protected _captureISOTime: boolean;
    protected _errorHandler: ErrorHandler;

    constructor() {
        super();
        this._captureStackTrace = true;
        this._captureISOTime = true;
        this._errorHandler = console.error;
    }

    public get highWaterMark(): number {
        return this._highWaterMark ?? stream.getDefaultHighWaterMark(false);
    }

    public set highWaterMark(highWaterMark: number) {
        this._highWaterMark = highWaterMark;
    }

    public get highWaterMarkObjectMode(): number {
        return this._highWaterMarkObjectMode ?? stream.getDefaultHighWaterMark(true);
    }

    public set highWaterMarkObjectMode(highWaterMarkObjectMode: number) {
        this._highWaterMarkObjectMode = highWaterMarkObjectMode;
    }

    public get captureStackTrace(): boolean{
        return this._captureStackTrace;
    }

    public set captureStackTrace(captureStackTrace: boolean) {
        this._captureStackTrace = captureStackTrace;
        this.emit('captureStackTrace', captureStackTrace);
    }

    public get captureISOTime(): boolean{
        return this._captureISOTime;
    }

    public set captureISOTime(captureISOTime: boolean) {
        this._captureISOTime = captureISOTime;
        this.emit('captureISOTime', captureISOTime);
    }

    public get errorHandler() {
        return this._errorHandler;
    }

    public set errorHandler(errorHandler: ErrorHandler) {
        this._errorHandler = errorHandler;
        this.emit('errorHandler', errorHandler);
    }

    public getWritableOptions(objectMode: boolean = true): stream.WritableOptions {
        return {
            highWaterMark: objectMode ? this._highWaterMarkObjectMode : this.highWaterMark
        };
    }

    public getReadableOptions(objectMode: boolean = true): stream.WritableOptions {
        return {
            highWaterMark: objectMode ? this._highWaterMarkObjectMode : this.highWaterMark
        };
    }

    public getDuplexOptions(writableObjectMode: boolean = true, readableObjectMode: boolean = true): stream.DuplexOptions {
        return {
            writableHighWaterMark: writableObjectMode ? this._highWaterMarkObjectMode : this.highWaterMark,
            readableHighWaterMark: readableObjectMode ? this._highWaterMarkObjectMode : this.highWaterMark
        };
    }
}

export default new Config();