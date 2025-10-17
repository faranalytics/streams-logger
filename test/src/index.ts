import * as net from "node:net";
import * as fs from "node:fs";
import { once } from "node:events";
import { test, after, describe } from "node:test";
import * as assert from "node:assert";
import {
  Logger,
  LogContext,
  Filter,
  SocketHandler,
  RotatingFileHandler,
  Formatter,
  SyslogLevel,
  SyslogLevelT,
} from "streams-logger";
import { Config, AnyToAnyEmitter, AnyToEmitter, AnyTransformToAny, AnyToVoid } from "@farar/nodes";

Config.debug = process.argv.some((value: string) => value.search(/verbose=true/) == 0);

await describe("Log a string that passes through a SocketHandler.", async () => {
  after(() => {
    server.close();
    socket.destroy();
    fs.readdirSync(".", { withFileTypes: true }).forEach((value: fs.Dirent) => {
      if (/[^.]+.log(\.\d*)?/.exec(value.name)) {
        fs.rmSync(value.name);
      }
    });
  });
  const serverRotatingFileHandler = new RotatingFileHandler({ path: "server.log" });
  const serverFormatter = new Formatter({ format: ({ message }) => message });
  const formatterNode = serverFormatter.connect(serverRotatingFileHandler);
  const server = net
    .createServer((socket: net.Socket) => {
      const socketHandler = new SocketHandler({ socket });
      socketHandler.connect(formatterNode.connect(socketHandler));
    })
    .listen(3000);
  const socket = net.createConnection({ port: 3000 });
  const anyToEmitter = new AnyToEmitter();
  const logger = new Logger({ name: "main", level: SyslogLevel.DEBUG });
  const formatter = new Formatter({
    format: ({ isotime, message, name, level, func, line, col }: LogContext<string, SyslogLevelT>) =>
      `${name ?? ""}:${isotime ?? ""}:${level}:${func ?? ""}:${line ?? ""}:${col ?? ""}:${message}\n`,
  });
  const filter = new Filter({ filter: (logContext: LogContext<string, SyslogLevelT>) => logContext.name == "main" });
  await once(socket, "connect");
  const socketHandler = new SocketHandler({ socket });
  const log = logger.connect(formatter.connect(filter.connect(socketHandler.connect(anyToEmitter))));

  void test("Log `Hello, World!` and assert that it passed through the graph.", async () => {
    const greeting = "Hello, World!";
    const result = once(anyToEmitter.emitter, "data") as Promise<LogContext<string, SyslogLevelT>[]>;
    log.warn(greeting);
    assert.match((await result)[0].message, new RegExp(`${greeting}\n$`));
  });

  void test('Log a long string, "Hello, World!" repeated 1e6 times, and assert that it passed through the graph.', async () => {
    const greeting = "Hello, World!".repeat(1e6);
    const result = once(anyToEmitter.emitter, "data") as Promise<LogContext<string, SyslogLevelT>[]>;
    log.warn(greeting);
    const message = (await result)[0].message;
    assert.strictEqual(message.slice(65).trim(), greeting);
  });

  void test("Log `Hello, World!` repeatedly, 1e4 iterations, and assert that each iteration passed through the graph.", async () => {
    for (let i = 0; i < 1e4; i++) {
      const greeting = "Hello, World!";
      const result = once(anyToEmitter.emitter, "data") as Promise<LogContext<string, SyslogLevelT>[]>;
      log.warn(greeting);
      const message = (await result)[0].message;
      assert.strictEqual(message.slice(65).trim(), greeting);
    }
  });

  await describe("Test error handling.", () => {
    const logger = new Logger({ name: "main", level: SyslogLevel.DEBUG });
    const formatter = new Formatter({
      format: ({ isotime, message, name, level, func, line, col }: LogContext<string, SyslogLevelT>) =>
        `${name ?? ""}:${isotime ?? ""}:${level}:${func ?? ""}:${line ?? ""}:${col ?? ""}:${message}\n`,
    });
    const filter = new Filter({ filter: (logContext: LogContext<string, SyslogLevelT>) => logContext.name == "main" });
    const anyToAnyEmitter = new AnyToAnyEmitter();

    const log = logger.connect(formatter.connect(filter.connect(anyToAnyEmitter)));

    void test("Test selective detachment of inoperable graph components.", async () => {
      const greeting = "Hello, World!";
      const anyToThrow = new AnyTransformToAny<LogContext<string, SyslogLevelT>, LogContext<string, SyslogLevelT>>({
        transform: () => {
          throw Error("AnyToThrow Error");
        },
      });
      const anyToVoid = new AnyToVoid();
      anyToThrow.connect(anyToVoid);
      formatter.connect(anyToThrow);
      assert.strictEqual(anyToThrow.writableCount, 1);
      assert.strictEqual(anyToVoid.writableCount, 1);
      log.warn(greeting);
      await new Promise((r) => setTimeout(r));
      assert.strictEqual(anyToThrow.writableCount, 0);
      assert.strictEqual(anyToVoid.writableCount, 0);
    });

    void test("Test that the graph is operable after the error.", async () => {
      const greeting = "Hello, World!";
      const result = once(anyToAnyEmitter.emitter, "data") as Promise<LogContext<string, SyslogLevelT>[]>;
      log.warn(greeting);
      assert.match((await result)[0].message, new RegExp(`${greeting}\n$`));
    });
  });
});

await describe("Log an object that passes through a SocketHandler.", async () => {
  after(() => {
    server.close();
    socket.destroy();
    fs.readdirSync(".", { withFileTypes: true }).forEach((value: fs.Dirent) => {
      if (/[^.]+.log(\.\d*)?/.exec(value.name)) {
        fs.rmSync(value.name);
      }
    });
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
    constructor(greeating = "Hello, World!", repeat = 1) {
      this.greeting = greeating.repeat(repeat);
    }
  }
  const serverRotatingFileHandler = new RotatingFileHandler<string>({ path: "server.log" });
  const serverFormatter = new Formatter<Greeter, string>({ format: ({ message }) => `${JSON.stringify(message)}\n` });
  const formatterNode = serverFormatter.connect(serverRotatingFileHandler);
  const server = net
    .createServer((socket: net.Socket) => {
      const socketHandler = new SocketHandler<Greeter>({ socket });
      socketHandler.connect(formatterNode, socketHandler);
    })
    .listen(3000);
  const socket = net.createConnection({ port: 3000 });
  await once(socket, "connect");
  const greeter = new Greeter("Hello, World!", 1);
  const anyToAnyEmitter = new AnyToAnyEmitter();
  const logger = new Logger<Greeter>({ name: "main", level: SyslogLevel.DEBUG });
  const formatter = new Formatter<Greeter, Greeter>({
    format: ({ message, isotime, name, level, func, url, line, col }: LogContext<Greeter, SyslogLevelT>) => {
      message.isotime = isotime;
      message.name = name;
      message.level = level;
      message.func = func;
      message.url = url;
      message.line = line;
      message.col = col;
      return message;
    },
  });
  const socketHandler = new SocketHandler<Greeter>({ socket });
  const log = logger.connect(formatter.connect(socketHandler.connect(anyToAnyEmitter)));

  void test("Log a `Greeter` object and assert that it passed through the graph.", async () => {
    const result = once(anyToAnyEmitter.emitter, "data") as Promise<LogContext<{ greeting: string }, SyslogLevelT>[]>;
    (function sayHello() {
      log.warn(greeter);
    })();
    assert.strictEqual((await result)[0].message.greeting, greeter.greeting);
  });

  void test("Log a `Greeter` object and assert that the function name was captured.", async () => {
    const result = once(anyToAnyEmitter.emitter, "data") as Promise<LogContext<{ greeting: string }, SyslogLevelT>[]>;
    (function sayHello() {
      log.warn(greeter);
    })();
    assert.strictEqual((await result)[0].func, "sayHello");
  });
});

await describe("Log a string that passes through a rotating file handler.", () => {
  after(() => {
    fs.readdirSync(".", { withFileTypes: true }).forEach((value: fs.Dirent) => {
      if (/[^.]+.log(\.\d*)?/.exec(value.name)) {
        fs.rmSync(value.name);
      }
    });
  });

  const MAX_SIZE = (1e5 * 50) / 5;
  const logger = new Logger<string>({ name: "main" });
  const formatter = new Formatter<string, string>({
    format: ({ isotime, message, name, level, func }: LogContext<string, SyslogLevelT>) =>
      `${name ?? ""}:${isotime ?? ""}:${level}:${func ?? ""}:${message}\n`,
  });
  const rotatingFileHandler = new RotatingFileHandler<string>({
    path: "message.log",
    rotationLimit: 5,
    maxSize: MAX_SIZE,
  });
  const anyToAnyEmitter = new AnyToAnyEmitter();

  const log = logger.connect(formatter.connect(anyToAnyEmitter, rotatingFileHandler));

  void test("Log 1e5 messages to a `RotatingFileHandler` and assert that it rotated 5 times and that each file is MAX_SIZE.", async () => {
    const iterations = 1e5;
    for (let i = 0; i < iterations; i++) {
      (function sayHello() {
        log.warn("01234"); // The message is 50 bytes once the timestamp and other contextual data is added to message.
      })();
    }
    await new Promise((r) => setTimeout(r, 10000));
    const results = fs
      .readdirSync(".", { withFileTypes: true })
      .filter((value) => /[^.]+.log(\.\d*)?/.exec(value.name))
      .map((value: fs.Dirent) => fs.statSync(value.name));
    assert.strictEqual(results.length, 5);
    for (const result of results) {
      assert.strictEqual(result.size, MAX_SIZE);
    }
  });
});
