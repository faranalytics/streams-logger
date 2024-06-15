import * as stream from "node:stream";
import { Transform } from "streams-logger";

class StringToNumber extends Transform<Buffer, number> {

    constructor() {
        super(new stream.Transform({
            writableObjectMode: true,
            readableObjectMode: true,
            transform: (chunk: Buffer, encoding: BufferEncoding, callback: stream.TransformCallback) => {
                const result = parseFloat(chunk.toString());
                callback(null, result);
            }
        }));
    }
}