import * as stream from "node:stream";

export class Connector<WriteT, ReadT> {

    public stream: stream.Writable;
    protected queue: Array<WriteT>;

    constructor(stream: stream.Writable) {
        this.stream = stream;
        this.queue = [];
    }

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

    public connect<T extends Connector<ReadT, unknown>>(connection: T): T {
        this.stream.pipe(connection.stream);
        return connection;
    }
}