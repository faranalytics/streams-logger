import * as stream from "node:stream";
import { Connector } from ".";

export class Transform<WriteT, ReadT> extends Connector<WriteT, ReadT> {

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