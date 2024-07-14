import * as net from 'node:net';
import { once } from 'node:events';
import { test, after, describe } from 'node:test';
import * as assert from 'node:assert';
import { Logger, LogContext, Filter, SocketHandler, RotatingFileHandler, Formatter, SyslogLevel, SyslogLevelT } from 'streams-logger';
import { AnyToAnyEmitter, AnyTransformToAny, AnyToVoid } from '@farar/nodes';

// streams.Config.setDefaultHighWaterMark(true, 1e6);
// streams.Config.setDefaultHighWaterMark(false, 1e6);

await describe('Log a string that passes through a SocketHandler.', async () => {
    after(() => {
        server.close();
        socket.destroy();
    });
    const serverRotatingFileHandler = new RotatingFileHandler({ path: 'server.log' });
    const serverFormatter = new Formatter({ format: async ({ message }) => message });
    const formatterNode = serverFormatter.connect(serverRotatingFileHandler);
    const server = net.createServer((socket: net.Socket) => {
        const socketHandler = new SocketHandler({ socket });
        socketHandler.connect(
            formatterNode.connect(
                socketHandler
            )
        );
    }).listen(3000);
    const socket = net.createConnection({ port: 3000 });
    const anyToAnyEmitter = new AnyToAnyEmitter();
    const logger = new Logger({ name: 'main', level: SyslogLevel.DEBUG });
    const formatter = new Formatter({
        format: async ({ isotime, message, name, level, func, line, col }: LogContext<string, SyslogLevelT>) => (
            `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`
        )
    });
    const filter = new Filter({ filter: (logContext: LogContext<string, SyslogLevelT>) => logContext.name == 'main' });
    await once(socket, 'connect');
    const socketHandler = new SocketHandler({ socket });
    const log = logger.connect(
        formatter.connect(
            filter.connect(
                socketHandler.connect(
                    anyToAnyEmitter
                )
            )
        )
    );
    void test('Log `Hello, World!` and assert that it passed through the graph unscathed.', async () => {
        const greeting = 'Hello, World!';
        const result = once(anyToAnyEmitter.emitter, 'data');
        log.warn(greeting);
        assert.match((await result)[0].message, new RegExp(`${greeting}\n$`));
    });
    void test('Log `Hello, World!` * 1e6  and assert that it passed through the graph unscathed.', async () => {
        const greeting = 'Hello, World!'.repeat(1e6);
        const result = once(anyToAnyEmitter.emitter, 'data');
        log.warn(greeting);
        const message = (await result)[0].message;
        assert.strictEqual(message.slice(65).trim(), greeting);
    });

    await describe('Test error handling.', () => {
        const logger = new Logger({ name: 'main', level: SyslogLevel.DEBUG });
        const formatter = new Formatter({
            format: async ({ isotime, message, name, level, func, line, col }: LogContext<string, SyslogLevelT>) => (
                `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`
            )
        });
        const filter = new Filter({ filter: (logContext: LogContext<string, SyslogLevelT>) => logContext.name == 'main' });
        const anyToAnyEmitter = new AnyToAnyEmitter();

        const log = logger.connect(
            formatter.connect(
                filter.connect(
                    anyToAnyEmitter
                )
            )
        );

        void test('Test selective termination of inoperable graph components.', async () => {
            const greeting = 'Hello, World!';
            const anyToThrow = new AnyTransformToAny({ transform: () => { throw Error('Error'); } });
            const anyToThrowChild = new AnyToVoid();
            anyToThrow.connect(anyToThrowChild);
            formatter.connect(anyToThrow);
            assert.strictEqual(anyToThrow.ins.length, 1);
            assert.strictEqual(anyToThrow.outs.length, 1);
            log.warn(greeting);
            await new Promise((r) => setTimeout(r));
            assert.strictEqual(anyToThrow.ins.length, 0);
            assert.strictEqual(anyToThrow.outs.length, 0);
        });

        void test('Test that the graph is operable after the error.', async () => {
            const greeting = 'Hello, World!';
            const result = once(anyToAnyEmitter.emitter, 'data');
            log.warn(greeting);
            assert.match((await result)[0].message, new RegExp(`${greeting}\n$`));
        });

    });
});

await describe('Log an object that passes through a SocketHandler.', async () => {
    after(() => {
        server.close();
        socket.destroy();
    });
    class Greeter {
        public greeting: string;
        public isotime?: string;
        public name?: string;
        public level?: string;
        public func?: string;
        public url?: string;
        public line?: string;
        public col?: string;
        constructor(greeating: string = 'Hello, World!', repeat: number = 1) {
            this.greeting = greeating.repeat(repeat);
        }
    }
    const serverRotatingFileHandler = new RotatingFileHandler<string>({ path: 'server.log' });
    const serverFormatter = new Formatter<Greeter, string>({ format: async ({ message }) => `${JSON.stringify(message)}\n` });
    const formatterNode = serverFormatter.connect(serverRotatingFileHandler);
    const server = net.createServer((socket: net.Socket) => {
        const socketHandler = new SocketHandler<Greeter>({ socket });
        socketHandler.connect(
            formatterNode,
            socketHandler
        );
    }).listen(3000);
    const socket = net.createConnection({ port: 3000 });
    await once(socket, 'connect');
    const greeter = new Greeter('Hello, World!', 1);
    const anyToAnyEmitter = new AnyToAnyEmitter();
    const logger = new Logger<Greeter>({ name: 'main', level: SyslogLevel.DEBUG });
    const formatter = new Formatter<Greeter, Greeter>({
        format: async ({ message, isotime, name, level, func, url, line, col }: LogContext<Greeter, SyslogLevelT>) => {
            message.isotime = isotime;
            message.name = name;
            message.level = level;
            message.func = func;
            message.url = url;
            message.line = line;
            message.col = col;
            return message;
        }
    });
    const socketHandler = new SocketHandler<Greeter>({ socket });
    const log = logger.connect(
        formatter.connect(
            socketHandler.connect(
                anyToAnyEmitter
            )
        )
    );
    void test('Log `Greeter` object and assert that it passed through the graph unscathed.', async () => {
        const result = once(anyToAnyEmitter.emitter, 'data');
        (function sayHello() {
            log.warn(greeter);
        }());
        assert.strictEqual((await result)[0].message.greeting, greeter.greeting);
    });
    void test('Log `Greeter` object and assert that function name was captured.', async () => {
        const result = once(anyToAnyEmitter.emitter, 'data');
        (function sayHello() {
            log.warn(greeter);
        }());
        assert.strictEqual((await result)[0].message.func, 'sayHello');
    });
});
