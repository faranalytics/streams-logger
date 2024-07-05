/* eslint-disable @typescript-eslint/no-unused-vars */
import * as net from 'node:net';
import * as fs from 'node:fs';
import * as streams from 'streams-logger';
import { describe, test } from 'node:test';
import * as assert from 'node:assert';
import { LogRecord, SyslogLevelT, Filter, SocketHandler, AnyToTest } from 'streams-logger';

// // streams.Config.setDefaultHighWaterMark(true, 1e6);
// // streams.Config.setDefaultHighWaterMark(false, 1e6);

const MESSAGE = 'Hello, World!'.repeat(3);
const suite = async (
    chunk: LogRecord<string, SyslogLevelT>,
    encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void
) => {
    await describe('Test.', async () => {
        await test('Assert that `chunk.message` matches `regExp`.', async () => {
            assert.match(chunk.message, /Hello, World!/);
        });
    });
    callback();
};

const anyToTest = new AnyToTest<LogRecord<string, SyslogLevelT>>({ suite });

net.createServer((socket: net.Socket) => {
    const socketHandler = new SocketHandler<string>({ socket });
    socketHandler.connect(socketHandler);
}).listen(3000);
const socket = net.createConnection({ port: 3000 });
await new Promise((r, e) => socket.once('connect', r).once('error', e));
const socketHandler = new SocketHandler<string>({ socket });

const logger = new streams.Logger<string>({ level: streams.SyslogLevel.DEBUG, name: 'test' });
const streams_formatter = new streams.Formatter<string>({
    format: async ({ isotime, message, name, level, func, url, line, col }) => (
        `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`
    )
});
const streams_filter = new streams.Filter<string>({
    filter: (record: LogRecord<string, SyslogLevelT>) => {
        return record.name == 'test';
    }
});

const consoleHandler = new streams.ConsoleHandler<string>({ level: streams.SyslogLevel.DEBUG });

const log = logger.connect(
    streams_formatter.connect(
        streams_filter.connect(
            socketHandler.connect(
                anyToTest,
                consoleHandler
            )
        )
    )
);

const streams_formatter_root = new streams.Formatter<unknown>({
    format: async ({ isotime, message, name, level, func, url, line, col }) => {
        if(typeof message == 'string') {
            return `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`
        }
    }
});
streams.root.connect(
    streams_formatter_root.connect(
        consoleHandler
    )
);

log.disconnect(streams.root);

function sayHello() {
    log.warn(MESSAGE);
}

sayHello();

setInterval(sayHello, 1e2);