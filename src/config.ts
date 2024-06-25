import * as stream from 'node:stream';

class Config {

    public defaultHighWaterMark: number;
    public defaultHighWaterMarkObjectMode: number;
    public captureStackTrace: boolean;

    constructor() {
        this.defaultHighWaterMark = stream.getDefaultHighWaterMark(false);
        this.defaultHighWaterMarkObjectMode = stream.getDefaultHighWaterMark(true);
        this.captureStackTrace = true;
    }

    setCaptureStackTrace(value: boolean) {
        this.captureStackTrace = value;
    }

    getDefaultHighWaterMark(objectMode: boolean): number {
        if (objectMode) {
            return this.defaultHighWaterMarkObjectMode;
        }
        else {
            return this.defaultHighWaterMark;
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