import { Transform, Levels, Message } from ".";

export interface LevelLoggerOptions {
    name:string;
    level: Levels;
}

export class LevelLogger extends Transform<string, Message<Levels>> {
    public level: Levels;

    constructor({name = '', level = Levels.BASE}: LevelLoggerOptions) {
        super((message: string) => new Message({ message, name, level }), {
            writableObjectMode: false,
            readableObjectMode: true
        });

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
