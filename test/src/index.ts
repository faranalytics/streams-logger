// import * as net from "node:net";

import { ConsoleHandler, Formatter, LogRecord, Logger, SyslogLevel, SyslogLevelT, Transform } from 'streams-logger';

const serializer = async ({ message, name, level, func, url, line, col }: LogRecord<string, SyslogLevelT>) => {
    return `${new Date().toISOString()}:${level}:${func}:${line}:${col}:${message}\n`;
}

const logger = new Logger({ name:'main', level: SyslogLevel.DEBUG });
const formatter = new Formatter(serializer);
const consoleHandler = new ConsoleHandler();


const log = logger.connect(
    formatter.connect(
        consoleHandler
    ),
)

function test() {
    log.debug('TEST');
    log.info('TEST');
}

function main() {
    test();
}

main();



// net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000);
// const socket = net.createConnection({ port: 3000 });
// await new Promise((r, e) => socket.once('connect', r).once('error', e));
// const socketHandler = new Transform<string, string>({ stream: socket });
