import { Connector, Levels, Message, Transform } from ".";

export class BufferToString extends Transform<Buffer, string> {
    constructor(encoding: BufferEncoding = 'utf-8') {
        super((chunk: Buffer) => chunk.toString(encoding));
    }
}

export class StringToBuffer extends Transform<string, Buffer> {
    constructor() {
        super((chunk: string, encoding?: BufferEncoding) => Buffer.from(chunk, encoding));
    }
}

export class StringToConsole extends Connector<string, never> {
    constructor() {
        super(process.stdout);
    }
}

export class MessageFormatter extends Transform<Message<Levels>, string> {
    constructor(transformer: (chunk: Message<Levels>) => string | Promise<string>) {
        super(transformer);
    }
}

