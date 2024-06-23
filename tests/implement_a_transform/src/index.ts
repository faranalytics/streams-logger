/* eslint-disable @typescript-eslint/no-unused-vars */
import * as stream from 'node:stream';
import { Transform, Config } from 'streams-logger';

class BufferToNumber extends Transform<Buffer, number> {

    public encoding: NodeJS.BufferEncoding = 'utf-8';

    constructor(transformOptions: stream.TransformOptions) {
        super(new stream.Transform({
            ...Config.getDuplexDefaults(false, true),
            ...transformOptions,
            ...{
                writableObjectMode: false,
                readableObjectMode: true,
                transform: (chunk: Buffer, encoding: BufferEncoding, callback: stream.TransformCallback) => {
                    const result = parseFloat(chunk.toString(this.encoding));
                    callback(null, result);
                }
            }
        })
        );
    }
}