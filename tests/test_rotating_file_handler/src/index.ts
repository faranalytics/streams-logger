/* eslint-disable @typescript-eslint/no-unused-vars */
import * as net from 'node:net';
import * as fs from 'node:fs';
import { Logger, Formatter, ConsoleHandler, RotatingFileHandler, SyslogLevel, Config, root} from 'streams-logger';
import { Console } from 'node:console';

// // streams.Config.setDefaultHighWaterMark(true, 1e6);
// // streams.Config.setDefaultHighWaterMark(false, 1e6);

if (fs.existsSync('message.log')) {
    fs.rmSync('message.log');
}


const logger = new Logger({ level: SyslogLevel.DEBUG, name: 'test' });
const formatter = new Formatter({
    format: async ({ isotime, message, name, level, func, url, line, col }) => (
        `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`
    )
});
const rotatingFileHandler = new RotatingFileHandler({ path: 'message.log', level: SyslogLevel.DEBUG });
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

const log = logger.connect(
    formatter.connect(
        consoleHandler,
        rotatingFileHandler
    )
);

// const out = fs.createWriteStream('streams-logger.out', { flags: 'w', autoClose: true });
// const console = new Console({stdout:out, stderr:out});

console.time('');
for (let i = 0; i < 1e4; i++) {
    logger.info('Hello World!');
}
process.on('exit', () => {
    console.timeEnd('');
});