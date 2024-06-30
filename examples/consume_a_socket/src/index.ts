/* eslint-disable @typescript-eslint/no-unused-vars */
import * as net from 'node:net';
import { once } from 'node:events';
import { Transform } from 'streams-logger';

net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000);
const socket = net.createConnection({ port: 3000 });
await once(socket, 'connect');
const socketHandler = new Transform<Buffer, Buffer>(socket);