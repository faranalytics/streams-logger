import * as stream from "node:stream";

/**
 * @typeParam WriteT - The type of the Writable side of the stream.
 * @typeParam ReadT - The type of the Readable side of the stream.
 */
export class Connector<WriteT, ReadT> {

    public stream: stream.Writable;
    protected queue: Array<WriteT>;

    constructor(stream: stream.Writable) {
        this.stream = stream;
        this.queue = [];
    }

    /**
    * @param data - Data of type `<WriteT>`.
    */
    protected async write(data: WriteT): Promise<void> {
        this.queue.push(data);
        if (!this.stream.writableNeedDrain) {
            while (this.queue.length) {
                if (!this.stream.write(this.queue.shift())) {
                    await new Promise((r) => this.stream.once('drain', r));
                }
            }
        }
    }

    /**
    * @typeParam T - A Connector of type <ReadT, WriteT>.
    * @param connector - A Connected or type `<T>`.
    */
    public connect<T extends Connector<ReadT, unknown>>(connector: T): T {
        this.stream.pipe(connector.stream);
        this.stream.once('error', connector.stream.destroy)
        connector.stream.once('error', this.stream.destroy);
        return connector;
    }
}