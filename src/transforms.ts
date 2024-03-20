import { Levels, Message, Transform } from ".";

/**
 * - Input: `<Buffer>`
 * - Output: `<string>`
 * 
 * @param encoding - A BufferEncoding - Default: `utf-8`.
 */
export class BufferToString extends Transform<Buffer, string> {
    constructor(encoding: BufferEncoding = 'utf-8') {
        super((chunk: Buffer) => chunk.toString(encoding));
    }
}

/**
 * - Input: `<string>`
 * - Output: `<Buffer>` 
 */
export class StringToBuffer extends Transform<string, Buffer> {
    constructor() {
        super((chunk: string, encoding?: BufferEncoding) => Buffer.from(chunk, encoding), { writableObjectMode: false, readableObjectMode: false });
    }
}

/**
 * - Input: `<Message<Levels>>`
 * - Output: `<string>` 
 * 
 * @param transformer - `<(chunk: Message<Levels>) => string | Promise<string>>`.
 */
export class MessageFormatter extends Transform<Message<Levels>, string> {
    constructor(transformer: (chunk: Message<Levels>) => string | Promise<string>) {
        super(transformer);
    }
}
