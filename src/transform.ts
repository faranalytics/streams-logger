import * as s from 'node:stream';

interface TransformOptions<InT, OutT> {
    stream: s.Writable;
    transform?: (data: InT, encoding?: BufferEncoding) => Promise<OutT>;
}

export class Transform<InT, OutT> {

    protected stream: s.Writable | s.Readable;
    protected queue: Array<InT>;

    constructor(stream: s.Writable) {
        this.stream = stream;
        this.queue = [];
    }

    public connect<T extends Transform<OutT, unknown>>(...transforms: Array<T>): typeof this {
        for (const transform of transforms) {
            if (this.stream instanceof s.Readable && transform.stream instanceof s.Writable) {
                this.stream?.pipe(transform.stream);
                this.stream.once('error', transform.stream.destroy);
                transform.stream.once('error', () => {
                    if (this.stream instanceof s.Readable && transform.stream instanceof s.Writable) {
                        this.stream.unpipe(transform.stream);
                    }
                });
            }
        }
        return this;
    }

    protected async write(data: InT, encoding?: BufferEncoding ): Promise<void> {
        try {
            if (this.stream instanceof s.Writable && !this.stream.writableNeedDrain) {
                this.queue.push(data);
                while (this.queue.length) {
                    const data = this.queue.shift();
                    if (!this.stream.write(data, encoding ?? 'utf-8')) {
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
