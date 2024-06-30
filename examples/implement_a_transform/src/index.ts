import * as stream from 'node:stream';
import { Transform, Config } from 'streams-logger';

export class BufferToNumber extends Transform<Buffer, number> {

    public encoding: NodeJS.BufferEncoding = 'utf-8';

    constructor() {
        super(new stream.Transform({
            ...Config.getDuplexDefaults(false, true),
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