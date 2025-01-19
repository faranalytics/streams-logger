import * as net from 'node:net';
import { once } from 'node:events';
import { Formatter, SocketHandler, RotatingFileHandler } from 'streams-logger';
import { parentPort } from 'node:worker_threads';

const rotatingFileHandler = new RotatingFileHandler({ path: 'server.log' });

const server = net.createServer((socket: net.Socket) => {
    
    // Create a socketHandler and formatter on each connection.
    const socketHandler = new SocketHandler({ socket });
    const formatter = new Formatter({ format: ({ message }) => (`${new Date().toISOString()}:${message}`) });

    // 1. Connect the socketHandler to the fomatter.
    // 2. Connect the formatter to the rotatingFileHandler and to the socketHandler; the message will be sent back to the client.
    socketHandler.connect(
        formatter.connect(
            rotatingFileHandler,
            socketHandler
        )
    );
});

server.listen(3000, '127.0.0.1');

await once(server, 'listening');

parentPort?.postMessage(null);