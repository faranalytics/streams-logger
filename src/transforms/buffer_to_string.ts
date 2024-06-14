import * as s from "node:stream";
import { Transform } from "../transform";

export interface BufferToStringOptions {
    encoding?: BufferEncoding;
}

export class BufferToString extends Transform<Buffer, string> {

    constructor(options: BufferToStringOptions = { encoding: 'utf-8' }) {
        super(new s.Transform({
            writableObjectMode: true,
            readableObjectMode: false,
            transform: async (chunk: Buffer, _encoding: BufferEncoding, callback: s.TransformCallback) => {
                callback(null, chunk.toString(_encoding ?? options.encoding));
            }
        }));
    }
}