import * as stream from "node:stream";
import { Connection } from ".";

/**
 * @typeParam WriteT
 * @typeParam ReadT 
 * 
 * @param transformer - `<(chunk: WriteT, encoding?: BufferEncoding) => ReadT | undefined | Promise<ReadT | undefined>>`.
 * @param transformOptions - `<stream.TransformOptions>`
 */
export class Transform<WriteT, ReadT> extends Connection<WriteT, ReadT> {

    constructor(transformer: (chunk: WriteT, encoding?: BufferEncoding) => ReadT | undefined | Promise<ReadT | undefined>, transformOptions?: stream.TransformOptions) {
        super(new stream.Transform({
            writableObjectMode: true,
            readableObjectMode: false,
            transform: async (chunk: WriteT, encoding: BufferEncoding, callback: stream.TransformCallback) => {
                try {
                    const result = await transformer(chunk, encoding);
                    callback(null, result);
                }
                catch (err) {
                    callback(err instanceof Error ? err : new TypeError());
                }
            },
            ...transformOptions
        }));
    }
}