import * as stream from 'node:stream';

export type ErrorHandler = (err: Error, ...params: Array<unknown>) => void;

class Config {

    protected _highWaterMark?: number;
    protected _highWaterMarkObjectMode?: number;
    public captureStackTrace: boolean;
    public captureISOTime: boolean;
    public errorHandler: ErrorHandler;

    constructor() {
        this.captureStackTrace = true;
        this.captureISOTime = true;
        this.errorHandler = console.error;
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

    public getWritableOptions = (objectMode: boolean = true): stream.WritableOptions => {
        return {
            highWaterMark: objectMode ? this._highWaterMarkObjectMode : this.highWaterMark
        };
    };

    public getReadableOptions = (objectMode: boolean = true): stream.WritableOptions => {
        return {
            highWaterMark: objectMode ? this._highWaterMarkObjectMode : this.highWaterMark
        };
    };

    public getDuplexOptions = (writableObjectMode: boolean = true, readableObjectMode: boolean = true): stream.DuplexOptions => {
        return {
            writableHighWaterMark: writableObjectMode ? this._highWaterMarkObjectMode : this.highWaterMark,
            readableHighWaterMark: readableObjectMode ? this._highWaterMarkObjectMode : this.highWaterMark
        };
    };
}

export default new Config();