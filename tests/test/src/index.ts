/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as net from 'node:net';
import * as fs from 'node:fs';
import * as stream from 'node:stream';
import * as streams from 'streams-logger';
import { describe, test } from 'node:test';
import * as assert from 'node:assert';
import { LogContext, SyslogLevelT, Filter, SocketHandler, AnyToTest } from 'streams-logger';

// streams.Config.setDefaultHighWaterMark(true, 1e6);
// streams.Config.setDefaultHighWaterMark(false, 1e6);

const MESSAGE = 'Hello, World!'.repeat(1);
const suite = async (
    chunk: LogContext<string, SyslogLevelT>,
    encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void
) => {
    await describe('Test.', async () => {
        await test('Assert that `chunk.message` matches `regExp`.', async () => {
            assert.match(chunk.message ?? '', /Hello, World!/);
        });
    });
    callback();
};

const anyToTest = new AnyToTest<LogContext<string, SyslogLevelT>>({ suite });

net.createServer((socket: net.Socket) => {
    const socketHandler = new SocketHandler({ socket });
    socketHandler.connect(socketHandler);
}).listen(3000);
const socket = net.createConnection({ port: 3000 });
await new Promise((r, e) => socket.once('connect', r).once('error', e));
const socketHandler = new SocketHandler({ socket });

const logger = new streams.Logger({ level: streams.SyslogLevel.DEBUG, name: 'test' });
const streams_formatter = new streams.Formatter({
    format: async ({ isotime, message, name, level, func, url, line, col }) => (
        `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`
    )
});
const streams_filter = new streams.Filter({
    filter: (record: LogContext<string, SyslogLevelT>) => {
        return record.name == 'test';
    }
});

const consoleHandler = new streams.ConsoleHandler({ level: streams.SyslogLevel.DEBUG });

const log = logger.connect(
    streams_formatter.connect(
        streams_filter.connect(
            socketHandler.connect(
                consoleHandler,
                anyToTest
            )
        )
    )
);

const formatter = new streams.Formatter({
    format: async ({ isotime, message, name, level, func, url, line, col }) => (
        `${isotime}:${level}:${func}:${line}:${col}:${message}\n`
    )
});

streams.root.connect(
    formatter.connect(
        consoleHandler
    )
);

log.disconnect(streams.root);

function sayHello() {
    log.warn(MESSAGE);
}

sayHello();

setInterval(sayHello, 1e3);


// const t1 = new stream.Transform({
//     objectMode: true,
//     transform: async (chunk: any, encoding: BufferEncoding, callback: stream.TransformCallback) => {
//         for (let now = Date.now(), then = now + 1000; now < then; now = Date.now());
//         console.log('t1');
//         callback(null, chunk);
//     }
// });

// const p1 = new stream.PassThrough();

// const t2 = new stream.Writable({
//     objectMode: true,
//     write: async (chunk: any, encoding: BufferEncoding, callback: stream.TransformCallback) => {
//         for (let now = Date.now(), then = now + 1000; now < then; now = Date.now());
//         console.log('t2');
//         process.stdout.write(chunk + '\n');
//         callback();
//     }
// });


// t1.pipe(p1).pipe(t2);

// const logger = new streams.Logger({ level: streams.SyslogLevel.DEBUG, name: 'test' });
// const formatter = new streams.Formatter({
//     format: async ({ isotime, message, name, level, func, url, line, col }) => {
//         for (let now = Date.now(), then = now + 1000; now < then; now = Date.now());
//         return `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`;
//     }
// });
// const consoleHandler = new streams.ConsoleHandler({ level: streams.SyslogLevel.DEBUG });

// const log = logger.connect(formatter.connect(consoleHandler));
// setTimeout(() => {
//     console.log('timeout');
// }, 1000);

// for (let i = 0; i < 10; i++) {
//     log.debug('test');
// }
