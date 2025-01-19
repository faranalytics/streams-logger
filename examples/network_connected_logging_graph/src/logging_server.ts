import * as net from 'node:net';
import { once } from 'node:events';
import { Formatter, SocketHandler, RotatingFileHandler } from 'streams-logger';
import { parentPort } from 'node:worker_threads';

const serverRotatingFileHandler = new RotatingFileHandler({ path: 'server.log' });
const serverFormatter = new Formatter({ format: ({ message }) => (`${new Date().toISOString()}:${message}`) });
const formatterNode = serverFormatter.connect(serverRotatingFileHandler);
const server = net.createServer((socket: net.Socket) => {
    const socketHandler = new SocketHandler({ socket });
    socketHandler.connect(
        formatterNode.connect(
            socketHandler
        )
    );
});

server.listen(3000, '127.0.0.1');

await once(server, 'listening');

parentPort?.postMessage(null);