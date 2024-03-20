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
    * @param connector - A Connector or type `<T>`.
    */
    public connect<T extends Connector<ReadT, unknown>>(connector: T): T {
        this.stream.pipe(connector.stream);
        if (!this.stream.eventNames().includes('error')) {
            this.stream.once('error', console.error);
        }

        this.stream.once('error', (error) => connector.stream.destroy(error));
        this.stream.once('close', () => this.stream.destroy(new Error(`${this.constructor.name}, ${this.stream.constructor.name}`)));

        connector.stream.once('error', (error) => this.stream.destroy(error));
        connector.stream.once('close', () => this.stream.destroy(new Error(`${this.constructor.name}, ${this.stream.constructor.name}`)));

        return connector;
    }
}