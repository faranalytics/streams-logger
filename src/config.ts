import * as stream from 'node:stream';

class Config {

    public defaultHighWaterMark?: number;
    public defaultHighWaterMarkObjectMode?: number;
    public captureStackTrace: boolean;

    constructor() {
        this.captureStackTrace = true;
    }

    setCaptureStackTrace(value: boolean) {
        this.captureStackTrace = value;
    }

    getDefaultHighWaterMark(objectMode: boolean): number {
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

    setDefaultHighWaterMark(objectMode: boolean, value: number): void {
        if (objectMode) {
            this.defaultHighWaterMarkObjectMode = value;
        }
        else {
            this.defaultHighWaterMark = value;
        }
    }

    getWritableDefaults(objectMode: boolean = true): stream.WritableOptions {
        return {
            highWaterMark: objectMode ? this.defaultHighWaterMarkObjectMode : this.defaultHighWaterMark
        };
    }

    getReadableDefaults(objectMode: boolean = true): stream.ReadableOptions {
        return {
            highWaterMark: objectMode ? this.defaultHighWaterMarkObjectMode : this.defaultHighWaterMark
        };
    }

    getDuplexDefaults(writableObjectMode: boolean = true, readableObjectMode: boolean = true): stream.DuplexOptions {
        const writableDefaults = this.getWritableDefaults(writableObjectMode);
        const readableDefaults = this.getReadableDefaults(readableObjectMode);
        return {
            writableHighWaterMark: writableDefaults.highWaterMark,
            readableHighWaterMark: readableDefaults.highWaterMark
        };
    }
}

export const config = new Config();