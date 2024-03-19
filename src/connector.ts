import * as stream from "node:stream";

export class Connector<WriteT, ReadT> {

    public writable: stream.Writable;
    protected queue: Array<WriteT>;

    constructor(writable: stream.Writable) {
        this.writable = writable;
        this.queue = [];
    }

    protected async write(data: WriteT): Promise<void> {
        this.queue.push(data);
        if (!this.writable.writableNeedDrain) {
            while (this.queue.length) {
                if (!this.writable.write(this.queue.shift())) {
                    await new Promise((r) => this.writable.once('drain', r));
                }
            }
        }
    }

    public connect<T extends Connector<ReadT, unknown>>(connection: T): T {
        this.writable.pipe(connection.writable);
        return connection;
    }
}