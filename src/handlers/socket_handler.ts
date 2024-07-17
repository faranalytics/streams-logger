import * as net from 'node:net';
import * as stream from 'node:stream';
import { LogContext } from '../commons/log_context.js';
import { SyslogLevel, SyslogLevelT } from '../commons/syslog.js';
import { Node } from '@farar/nodes';
import { Config } from '../index.js';

export interface SocketHandlerOptions {
    socket: net.Socket;
    reviver?: (this: unknown, key: string, value: unknown) => unknown;
    replacer?: (this: unknown, key: string, value: unknown) => unknown;
    space?: string | number;
    level?: SyslogLevel;
}

export class SocketHandler<MessageT = string> extends Node<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>> {

    public level: SyslogLevel;

    protected _space?: string | number;
    protected _replacer?: (this: unknown, key: string, value: unknown) => unknown;
    protected _reviver?: (this: unknown, key: string, value: unknown) => unknown;
    protected _socket: net.Socket;
    protected _ingressQueue: Buffer;
    protected _messageSize: number | null;

    constructor({ socket, reviver, replacer, space, level = SyslogLevel.WARN }: SocketHandlerOptions, streamOptions?: stream.DuplexOptions) {
        super(new stream.Duplex({
            ...streamOptions, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                read: (size: number) => {
                    this._push();
                },
                write: (logContext: LogContext<MessageT, SyslogLevelT>, _encoding: BufferEncoding, callback: stream.TransformCallback) => {
                    try {
                        if (SyslogLevel[logContext.level] <= this.level) {
                            const data = this.serializeMessage(logContext);
                            const size = Buffer.alloc(6, 0);
                            size.writeUIntBE(data.length + 6, 0, 6);
                            const buf = Buffer.concat([size, data]);
                            if (!this._socket.write(buf)) {
                                this._socket.once('drain', callback);
                            }
                            else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    }
                    catch (err) {
                        if (err instanceof Error) {
                            callback(err);
                            Config.errorHandler(err);
                        }
                    }
                }
            }
        }));
        this._push = this._push.bind(this);
        this.level = level ?? SyslogLevel.WARN;
        this._reviver = reviver;
        this._replacer = replacer;
        this._space = space;
        this._ingressQueue = Buffer.allocUnsafe(0);
        this._messageSize = null;
        this._socket = socket;
        this._socket.on('data', (data: Buffer) => {
            this._ingressQueue = Buffer.concat([this._ingressQueue, data]);
        });
    }

    protected _push() {
        if (this._ingressQueue.length > 6) {
            this._messageSize = this._ingressQueue.readUintBE(0, 6);
        }
        else {
            this._socket.once('data', this._push);
            return;
        }
        if (this._ingressQueue.length >= this._messageSize) {
            const buf = this._ingressQueue.subarray(6, this._messageSize);
            this._ingressQueue = this._ingressQueue.subarray(this._messageSize, this._ingressQueue.length);
            const message = this.deserializeMessage(buf);
            if (this._stream instanceof stream.Readable) {
                this._stream.push(message);
            }
        }
        else {
            this._socket.once('data', this._push);
        }
    }

    protected serializeMessage(message: LogContext<MessageT, SyslogLevelT>): Buffer {
        return Buffer.from(JSON.stringify(message, this._replacer, this._space), 'utf-8');
    }

    protected deserializeMessage(data: Buffer): LogContext<MessageT, SyslogLevelT> {
        return new LogContext(<LogContext<MessageT, SyslogLevelT>>JSON.parse(data.toString('utf-8'), this._reviver));
    }

    public setLevel(level: SyslogLevel) {
        this.level = level;
    }
}