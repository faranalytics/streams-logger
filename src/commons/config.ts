import * as stream from 'node:stream';

export type ErrorHandler = (err: Error, ...params: Array<unknown>) => void;

class Config {

    public highWaterMark: number;
    public highWaterMarkObjectMode: number;
    public captureStackTrace: boolean;
    public captureISOTime: boolean;
    public errorHandler: ErrorHandler;

    constructor() {
        this.highWaterMark = stream.getDefaultHighWaterMark(false);
        this.highWaterMarkObjectMode = stream.getDefaultHighWaterMark(true);
        this.captureStackTrace = true;
        this.captureISOTime = true;
        this.errorHandler = console.error;
    }

    public getWritableOptions(objectMode: boolean = true): stream.WritableOptions {
        return {
            highWaterMark: objectMode ? this.highWaterMarkObjectMode : this.highWaterMark
        };
    }

    public getReadableOptions(objectMode: boolean = true): stream.WritableOptions {
        return {
            highWaterMark: objectMode ? this.highWaterMarkObjectMode : this.highWaterMark
        };
    }

    public getDuplexOptions(writableObjectMode: boolean = true, readableObjectMode: boolean = true): stream.DuplexOptions {
        return {
            writableHighWaterMark: writableObjectMode ? this.highWaterMarkObjectMode : this.highWaterMark,
            readableHighWaterMark: readableObjectMode ? this.highWaterMarkObjectMode : this.highWaterMark
        };
    }
}

export const config = new Config();