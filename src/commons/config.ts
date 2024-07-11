import * as stream from 'node:stream';

class Config {

    public defaultHighWaterMark?: number;
    public defaultHighWaterMarkObjectMode?: number;
    public captureStackTrace: boolean;
    public captureISOTime: boolean;

    constructor() {
        this.captureStackTrace = true;
        this.captureISOTime = true;
    }

    public setCaptureStackTrace(value: boolean) {
        this.captureStackTrace = value;
    }

    public setCaptureISOTime(value: boolean) {
        this.captureISOTime = value;
    }

    public getDefaultHighWaterMark(objectMode: boolean): number {
        if (objectMode) {
            if (this.defaultHighWaterMarkObjectMode) {
                return this.defaultHighWaterMarkObjectMode;
            }
            else {
                return stream.getDefaultHighWaterMark(true);
            }
        }
        else {
            if (this.defaultHighWaterMark) {
                return this.defaultHighWaterMark;
            }
            else {
                return stream.getDefaultHighWaterMark(false);
            }
        }
    }

    public setDefaultHighWaterMark(objectMode: boolean, value: number): void {
        if (objectMode) {
            this.defaultHighWaterMarkObjectMode = value;
        }
        else {
            this.defaultHighWaterMark = value;
        }
    }

    public getWritableDefaults(objectMode: boolean = true): stream.WritableOptions {
        return {
            highWaterMark: this.getDefaultHighWaterMark(objectMode)
        };
    }

    public getReadableDefaults(objectMode: boolean = true): stream.ReadableOptions {
        return {
            highWaterMark: this.getDefaultHighWaterMark(objectMode)
        };
    }

    public getDuplexDefaults(writableObjectMode: boolean = true, readableObjectMode: boolean = true): stream.DuplexOptions {
        const writableDefaults = this.getWritableDefaults(writableObjectMode);
        const readableDefaults = this.getReadableDefaults(readableObjectMode);
        return {
            writableHighWaterMark: writableDefaults.highWaterMark,
            readableHighWaterMark: readableDefaults.highWaterMark
        };
    }
}

export const config = new Config();