# _A Network Connected Streams Logging Graph_

## Introduction

In this example you will contruct two _Streams_ logging graphs that are connected by a `SocketHandler` at each end of the network socket. The log message will be logged to the console on the client side and to a file on the server side.

## Step by step

A `Logger` is used in order to log a `Hello, World!` message. The message undergoes the following transformations:

- The message is formatted; the formatted message contains the `Logger` name, ISO time, log `Level`, function name, line number, column number, and the message.
- The message is logged to the console using a `ConsoleHandler`.
- The `LogContext` is serialized and sent over a socket to a server using a `SocketHandler`.
- The serialized `LogContext` is deserialized to a `LogContext` object using a `SocketHandler`.
- A server timestamp is prepended to the message using a `Formatter`.
- The message is logged to a file named `server.log` using a `RotatingFileHandler`.
- The message is sent over a socket back to the client using the same `SocketHandler`.
- The message is logged to the console using a `ConsoleHandler`.

## Implement the example

### Implement the `logging_server.ts` module.

This module runs a `net.Server`. The `net.Server` will receive messages from the client. The `SocketHandler` prepends messages with a timestamp, log the message to a file, and send the message back to the client.

```ts
import * as net from "node:net";
import { once } from "node:events";
import { Formatter, SocketHandler, RotatingFileHandler } from "streams-logger";
import { parentPort } from "node:worker_threads";

const rotatingFileHandler = new RotatingFileHandler({ path: "server.log" });

const server = net.createServer((socket: net.Socket) => {
  // Create a socketHandler and formatter on each connection.
  const socketHandler = new SocketHandler({ socket });
  const formatter = new Formatter({
    format: ({ message }) => `${new Date().toISOString()}:${message}`,
  });

  // 1. Connect the socketHandler to the fomatter.
  // 2. Connect the formatter to the rotatingFileHandler and to the socketHandler; the message will be sent back to the client.
  socketHandler.connect(formatter.connect(rotatingFileHandler, socketHandler));
});

server.listen(3000, "127.0.0.1");
await once(server, "listening");
parentPort?.postMessage(null);
```

### Implement the `index.ts` module

This is the main thread. This module starts a "logging server" in a worker thread. The `Logger` is configured to format the message, log it to the console, and send it to the listening server.

Once the server is listening for connections, a connection is made with the logging server. The `SocketHandler` sends a message over a `net.Socket` to the logging server and receives the message from the server with the prepended server timestamp. Finally, it logs the message to the console.

```ts
import * as net from "node:net";
import { once } from "node:events";
import { Worker } from "node:worker_threads";
import {
  Logger,
  Formatter,
  ConsoleHandler,
  SocketHandler,
  SyslogLevel,
} from "streams-logger";

const worker = new Worker("./dist/logging_server.js");
await once(worker, "message"); // Wait for the server to bind to the interface.

const socket = net.createConnection({ port: 3000, host: "127.0.0.1" });
await once(socket, "connect");

const socketHandler = new SocketHandler({ socket });
const logger = new Logger({ name: "main", level: SyslogLevel.DEBUG });
const formatter = new Formatter({
  format: ({ isotime, message, name, level, func, line, col }) =>
    `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`,
});
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

// 1. Connect the logger to the fomatter
// 2. Connect the fommater to the consoleHandler and the socketHandler
// 3. Connect the socketHandler to the consoleHandler
const log = logger.connect(
  formatter.connect(consoleHandler, socketHandler.connect(consoleHandler))
);

(function sayHello() {
  log.warn("Hello, World!");
})();
```

## Run the example

### How to run the example

#### Clone the _Streams_ repository.

```bash
git clone https://github.com/faranalytics/streams-logger.git
```

#### Change directory into the relevant example directory.

```bash
cd streams-logger/examples/network_connected_logging_graph
```

#### Install the example dependencies.

```bash
npm install && npm update
```

#### Build the application.

```bash
npm run clean:build
```

#### Run the application.

```bash
npm start
```

##### Output

`server.log`

```bash
2024-07-02T23:13:18.754Z:main:2024-07-02T23:13:18.752Z:WARN:sayHello:22:9:Hello, World!
```

`console`

```bash
main:2024-07-02T23:13:18.752Z:WARN:sayHello:22:9:Hello, World!
2024-07-02T23:13:18.754Z:main:2024-07-02T23:13:18.752Z:WARN:sayHello:22:9:Hello, World!
```
