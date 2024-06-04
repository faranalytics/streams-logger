import * as s from 'node:stream';


interface TransformOptions<InT, OutT> {
    stream: s.Writable;
    transform?: (data: InT) => Promise<OutT>;
}

export class Transform<InT, OutT> {

    protected stream: s.Writable;

    constructor({ stream, transform }: TransformOptions<InT, OutT>) {
        this.stream = stream;

        if (transform && stream instanceof s.Transform) {
            stream._transform = async (chunk: InT, encoding: BufferEncoding, callback: s.TransformCallback) => {
                const result = await transform?.(chunk);
                callback(null, result);
            }
        }
    }

    public connect<T extends Transform<OutT, unknown>>(transform: T): T {
        this.stream?.pipe(transform.stream);
        return transform;
    }

    protected write(data: InT) {
        this.stream.write(data);
    }
}
