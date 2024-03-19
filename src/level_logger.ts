import * as stream from "node:stream";
import { Connector, Levels, Message } from ".";

export class LevelLogger extends Connector<string, Message<Levels>> {
    public level: Levels;

    constructor(level: Levels = Levels.BASE) {
        super(new stream.Transform({
            writableObjectMode: false,
            readableObjectMode: true,
            transform: async (message: string, encoding: BufferEncoding, callback: stream.TransformCallback) => {
                callback(null, new Message({ message, name: 'Test', level }));
            }
        }));

        this.level = level;
    }

    base(message: string) {
        if (this.level >= Levels.BASE) {
            this.write(message);
        }
    }

    debug(message: string) {
        if (this.level >= Levels.DEBUG) {
            this.write(message);
        }
    }

    info(message: string) {
        if (this.level >= Levels.INFO) {
            this.write(message);
        }
    }

    warn(message: string) {
        if (this.level >= Levels.WARN) {
            this.write(message);
        }
    }

    error(message: string) {
        if (this.level >= Levels.ERROR) {
            this.write(message);
        }
    }
}
