# *A Network Connected **Streams** Logging Graph*

In this example you will contruct two *Streams* logging graphs that are connected by a `SocketHandler` at each end of the network socket.  The log message will be logged to the console on the client side and to a file on the server side.

## Step by Step
A `Logger` is used in order to log a `Hello, World!` message.  The message undergoes the following trasnformations:

- The message is formatted and serialized; the serialized message contains the `Logger` name, ISO time, log `Level`, function name, line number, column number, and the message.
- The message is logged to the console using a `ConsoleHandler`.
- The message is sent over a socket to a server using a `SocketHandler`.  
- The message is deserialized to a `LogRecord` using a `SocketHandler`.
- A server timestamp is prepended to the message using a `Formatter`.
- The message is logged to a file named `server.log` using a `RotatingFileHandler`.
- The message is sent over a socket back to the client using the same `SocketHandler`.
- The message is logged to the console using a `ConsoleHandler`.

## Implementation

`index.ts`
```ts
import * as net from 'node:net';
import { once } from 'node:events';
import { Logger, Formatter, ConsoleHandler, SocketHandler, SyslogLevel, RotatingFileHandler } from 'streams-logger';

const serverRotatingFileHandler = new RotatingFileHandler({ path: 'server.log' });
const serverFormatter = new Formatter({ format: async ({ message }) => (`${new Date().toISOString()}:${message}`) });
const formatterNode = serverFormatter.connect(serverRotatingFileHandler);
net.createServer((socket: net.Socket) => {
    const socketHandler = new SocketHandler({ socket });
    socketHandler.connect(
        formatterNode.connect(
            socketHandler
        )
    );
}).listen(3000);

const socket = net.createConnection({ port: 3000 });
await once(socket, 'connect');
const socketHandler = new SocketHandler({ socket });
const logger = new Logger({ name: 'main', level: SyslogLevel.DEBUG });
const formatter = new Formatter({
    format: async ({ isotime, message, name, level, func, url, line, col }) => (
        `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`
    )
});
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

const log = logger.connect(
    formatter.connect(
        consoleHandler,
        socketHandler.connect(
            consoleHandler
        )
    )
);

(function sayHello() {
    log.warn('Hello, World!');
})();
```

## Instructions

Follow the instructions to run the example.

### Clone the *Streams* repo.
```bash
git clone https://github.com/faranalytics/streams-logger.git
```
### Change directory into the relevant example directory.
```bash
cd streams-logger/examples/network_connected_logging_graph
```
### Install the example dependencies.
```bash
npm install && npm update
```
### Build the application.
```bash
npm run clean:build
```
### Run the application.
```bash
npm start
```
#### Output
##### `server.log`
```bash
2024-07-02T23:13:18.754Z:main:2024-07-02T23:13:18.752Z:WARN:sayHello:22:9:Hello, World!
```
##### `console`
```bash
main:2024-07-02T23:13:18.752Z:WARN:sayHello:22:9:Hello, World!
2024-07-02T23:13:18.754Z:main:2024-07-02T23:13:18.752Z:WARN:sayHello:22:9:Hello, World!
````