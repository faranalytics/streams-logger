import * as stream from "node:stream";
import { Transform } from "streams-logger";

export async function transform(data: string): Promise<number> {
    return parseInt(data);
}

export class StringToNumber extends Transform<string, number> {

    constructor() {
        super({ stream: new stream.Transform({ writableObjectMode: true, readableObjectMode: true }), transform });
    }

    public convert(num: string): void {
        this.write(num);
    }
}