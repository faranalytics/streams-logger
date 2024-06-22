/* eslint-disable @typescript-eslint/no-unused-vars */
import * as net from 'node:net';
import { Transform } from 'streams-logger';

net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000);
const socket = net.createConnection({ port: 3000 });
await new Promise((r, e) => socket.once('connect', r).once('error', e));
const socketHandler = new Transform<Buffer, Buffer>(socket);