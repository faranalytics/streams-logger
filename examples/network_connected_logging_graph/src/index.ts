/* eslint-disable @typescript-eslint/no-unused-vars */
import * as net from 'node:net';
import * as fs from 'node:fs';
import * as streams from 'streams-logger';
import { describe, test } from 'node:test';
import * as assert from 'node:assert';
import { LogRecord, SyslogLevelT } from 'streams-logger';
import { SocketHandler } from 'streams-logger';

net.createServer((socket: net.Socket) => {
    const socketHandler1 = new SocketHandler<LogRecord<string, SyslogLevelT>, LogRecord<string, SyslogLevelT>>({ socket });
    const socketHandler2 = new SocketHandler<LogRecord<string, SyslogLevelT>, LogRecord<string, SyslogLevelT>>({ socket });
    socketHandler1.connect(socketHandler2);
}).listen(3000);
const socket = net.createConnection({ port: 3000 });
await new Promise((r, e) => socket.once('connect', r).once('error', e));
const socketHandler = new SocketHandler<LogRecord<string, SyslogLevelT>, LogRecord<string, SyslogLevelT>>({ socket });