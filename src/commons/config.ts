import * as stream from 'node:stream';
import { EventEmitter } from 'node:events';

export type ErrorHandler = (err: Error, ...params: Array<unknown>) => void;

class Config extends EventEmitter {

    public _highWaterMark?: number;
    public _highWaterMarkObjectMode?: number;
    public _captureStackTrace: boolean;
    public _captureISOTime: boolean;
    public _errorHandler: ErrorHandler;

    constructor() {
        super();
        this._captureStackTrace = true;
        this._captureISOTime = true;
        this._errorHandler = console.error;
    }

    public get highWaterMark(): number {
        return this._highWaterMark ?? stream.getDefaultHighWaterMark(false);
    }


    public get highWaterMarkObjectMode(): number {
        return this._highWaterMarkObjectMode ?? stream.getDefaultHighWaterMark(true);
    }

    public set highWaterMark(highWaterMark: number) {
        this._highWaterMark = highWaterMark;
    }

    public set highWaterMarkObjectMode(highWaterMarkObjectMode: number) {
        this._highWaterMarkObjectMode = highWaterMarkObjectMode;
    }

    public set captureStackTrace(captureStackTrace: boolean) {
        this._captureStackTrace = captureStackTrace;
        this.emit('captureStackTrace', captureStackTrace);
    }

    public get captureStackTrace(): boolean{
        return this._captureStackTrace;
    }

    public set captureISOTime(captureISOTime: boolean) {
        this._captureISOTime = captureISOTime;
        this.emit('captureISOTime', captureISOTime);
    }

    public get captureISOTime(): boolean{
        return this._captureISOTime;
    }

    public set errorHandler(errorHandler: ErrorHandler) {
        this._errorHandler = errorHandler;
        this.emit('errorHandler', errorHandler);
    }

    public get errorHandler() {
        return this._errorHandler;
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