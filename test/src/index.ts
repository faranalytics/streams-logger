
import * as strm from 'node:stream';
import { LogRecord, Transform } from 'streams-logger';


class Logger extends Transform<string, LogRecord> {

    constructor() {
        super({ stream: new strm.Transform() });
    }
}

const t1 = new Transform<string, string>({});
const t2 = new Transform<string, string>({});
const t3 = new Transform<string, string>({});

t1.connect(t2).connect(t3);