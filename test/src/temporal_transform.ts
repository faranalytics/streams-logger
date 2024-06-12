import * as s from "node:stream";
import { Transform } from "streams-logger";

export interface TemporalTransformOptions {
    time: number;
}

export class TemporalTransform extends Transform<string, string> {

    constructor(options?: TemporalTransformOptions) {
        super(new s.Transform({
                writableObjectMode: true,
                readableObjectMode: true,
                transform: async (chunk: string, encoding: BufferEncoding, callback: s.TransformCallback) => {
                    await new Promise((r,e)=> setTimeout(r, options?.time));
                    callback(null, chunk);
                }
            })
        );
    }
}