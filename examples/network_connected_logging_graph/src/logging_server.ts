import * as net from 'node:net';
import { once } from 'node:events';
import { Formatter, SocketHandler, RotatingFileHandler } from 'streams-logger';
import { parentPort } from 'node:worker_threads';

const rotatingFileHandler = new RotatingFileHandler({ path: 'server.log' });
const formatter = new Formatter({ format: ({ message }) => (`${new Date().toISOString()}:${message}`) });

// Connect the formatter to the rotatingFileHandler.
formatter.connect(rotatingFileHandler);

const server = net.createServer((socket: net.Socket) => {
    // Create a socketHandler on each connection.
    const socketHandler = new SocketHandler({ socket });

    // 1. Connect the socketHandler to the fomatter
    // 2. Connect the formatter back to the socketHandler; the message will be sent back to the client.
    socketHandler.connect(
        formatter.connect(
            socketHandler
        )
    );
});

server.listen(3000, '127.0.0.1');

await once(server, 'listening');

parentPort?.postMessage(null);