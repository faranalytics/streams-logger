import * as s from 'node:stream';

interface TransformOptions<InT, OutT> {
    stream: s.Writable;
    transform?: (data: InT) => Promise<OutT>;
}

export class Transform<InT, OutT> {

    protected stream: s.Writable;
    protected queue: Array<InT>;

    constructor({ stream, transform }: TransformOptions<InT, OutT>) {
        this.stream = stream;
        this.queue = [];

        if (transform && stream instanceof s.Transform) {
            stream._transform = async (chunk: InT, encoding: BufferEncoding, callback: s.TransformCallback) => {
                const result = await transform?.(chunk);
                callback(null, result);
            }
        }
    }

    public connect<T extends Transform<OutT, unknown>>(...transforms: Array<T>): typeof this {
        for (const transform of transforms) {
            if (this.stream instanceof s.Readable) {
                this.stream?.pipe(transform.stream);
                this.stream.once('error', transform.stream.destroy);
                transform.stream.once('error', () => {
                    if (this.stream instanceof s.Readable) {
                        this.stream.unpipe(transform.stream);
                    }
                });
            }
        }
        return this;
    }

    protected async write(data: InT): Promise<void> {
        try {
            if (!this.stream.writableNeedDrain) {
                this.queue.push(data);
                while (this.queue.length) {
                    const data = this.queue.shift();
                    if (!this.stream.write(data)) {
                        await new Promise((r, e) => this.stream.once('drain', r).once('error', e));
                    }
                }
            }
            else {
                this.queue.push(data);
            }
        }
        catch (err) {
            console.error(err);
        }
    }
}
