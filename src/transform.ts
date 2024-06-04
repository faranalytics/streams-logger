import * as strm from 'node:stream';

interface TransformOptions<IntT, OutT> {
    stream?: strm.Transform;
    transform?: (data: IntT) => Promise<OutT>;
}

export abstract class Transform<InT, OutT> {

    protected stream?: strm.Transform;

    constructor({ stream, transform }: TransformOptions<InT, OutT>) {
        this.stream = stream;

        if (stream instanceof strm.Transform) {
            stream._transform = async (chunk: InT, encoding: BufferEncoding, callback: strm.TransformCallback) => {
                const result = await this.transform(chunk);
                callback(null, result);
            }
        }
    }

    public connect<T extends Transform<OutT, unknown>>(transform: T): T {
        return transform;
    }

    protected abstract transform(data: InT): Promise<OutT>;
}
