import * as s from "node:stream";
import { Transform } from "../transform";

export interface StringToBufferOptions {
    encoding?: BufferEncoding;
}

export class StringToBuffer extends Transform<string, Buffer> {

    constructor(options: StringToBufferOptions = { encoding: 'utf-8' }) {
        super(new s.Transform({
            writableObjectMode: true,
            readableObjectMode: false,
            transform: async (chunk: string, _encoding: BufferEncoding, callback: s.TransformCallback) => {
                callback(null, Buffer.from(chunk, _encoding ?? options.encoding));
            }
        }));
    }
}