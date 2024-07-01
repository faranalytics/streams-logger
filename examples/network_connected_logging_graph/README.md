# *A Network Connected **Streams** Logging Graph*

In this example you will contruct a *Streams* logging graph that incorporates a `SocketHandler` at each end of the network socket.  

## Step by Step
1. A `Logger` is used in order to log a `Hello, World!` message.  
2. The message is formatted.
3. The message is serialized, and sent over a socket to a server.  
4. The server serializes and echos the `LogRecord` back to the client. 
5. The message is finally deserialized and logged to the console.

## Implementation

`index.ts`
```ts
import * as net from 'node:net';
import { once } from 'node:events';
import { Logger, Formatter, ConsoleHandler, SocketHandler, SyslogLevel } from 'streams-logger';

net.createServer((socket: net.Socket) => {
    const socketHandlerIn = new SocketHandler({ socket });
    const socketHandlerOut = new SocketHandler({ socket });
    socketHandlerIn.connect(socketHandlerOut);
}).listen(3000);
const socket = net.createConnection({ port: 3000 });
await once(socket, 'connect');
const socketHandler = new SocketHandler({ socket });

const logger = new Logger({ level: SyslogLevel.DEBUG, name: 'main' });
const formatter = new Formatter({
    format: async ({ isotime, message, name, level, func, url, line, col }) => (
        `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`
    )
});
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

const log = logger.connect(
    formatter.connect(
        socketHandler.connect(
            consoleHandler
        )
    )
);

log.warn('Hello, World!');
```

## Instructions

Follow the instructions to run the example.

### Clone the Streams repo.
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
```bash
main:2024-06-30T15:17:25.109Z:WARN:undefined:17:5:Hello, World!
```