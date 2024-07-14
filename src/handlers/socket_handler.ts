import * as net from 'node:net';
import * as stream from 'node:stream';
import { LogContext } from '../commons/log_context.js';
import { SyslogLevel, SyslogLevelT } from '../commons/syslog.js';
import { Node, $stream } from '@farar/nodes';
import { Config } from '../index.js';

export interface SocketHandlerConstructorOptions {
    socket: net.Socket;
    reviver?: (this: unknown, key: string, value: unknown) => unknown;
    replacer?: (this: unknown, key: string, value: unknown) => unknown;
    space?: string | number;
    level?: SyslogLevel;
}

export class SocketHandler<MessageT = string> extends Node<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>> {

    public option: Required<Pick<SocketHandlerConstructorOptions, 'level'>> & Omit<SocketHandlerConstructorOptions, 'socket' | 'level'>;

    protected socket: net.Socket;
    protected ingressQueue: Buffer;
    protected messageSize: number | null;

    constructor({ socket, reviver, replacer, space, level = SyslogLevel.WARN }: SocketHandlerConstructorOptions, streamOptions?: stream.DuplexOptions) {
        super(new stream.Duplex({
            ...streamOptions, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                read: (size: number) => {
                    this.push();
                },
                write: (logContext: LogContext<MessageT, SyslogLevelT>, _encoding: BufferEncoding, callback: stream.TransformCallback) => {
                    try {
                        if (SyslogLevel[logContext.level] <= this.option.level) {
                            const data = this.serializeMessage(logContext);
                            const size = Buffer.alloc(6, 0);
                            size.writeUIntBE(data.length + 6, 0, 6);
                            const buf = Buffer.concat([size, data]);
                            if (!this.socket.write(buf)) {
                                this.socket.once('drain', callback);
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
        this.push = this.push.bind(this);
        this.option = {
            level: level ?? SyslogLevel.WARN,
            reviver,
            replacer,
            space
        };
        this.ingressQueue = Buffer.allocUnsafe(0);
        this.messageSize = null;
        this.socket = socket;
        this.socket.on('data', (data: Buffer) => {
            this.ingressQueue = Buffer.concat([this.ingressQueue, data]);
        });
    }

    protected push() {
        if (this.ingressQueue.length > 6) {
            this.messageSize = this.ingressQueue.readUintBE(0, 6);
        }
        else {
            this.socket.once('data', this.push);
            return;
        }
        if (this.ingressQueue.length >= this.messageSize) {
            const buf = this.ingressQueue.subarray(6, this.messageSize);
            this.ingressQueue = this.ingressQueue.subarray(this.messageSize, this.ingressQueue.length);
            const message = this.deserializeMessage(buf);
            if (this[$stream] instanceof stream.Readable) {
                this[$stream].push(message);
            }
        }
        else {
            this.socket.once('data', this.push);
        }
    }

    protected serializeMessage(message: LogContext<MessageT, SyslogLevelT>): Buffer {
        return Buffer.from(JSON.stringify(message, this.option.replacer, this.option.space), 'utf-8');
    }

    protected deserializeMessage(data: Buffer): LogContext<MessageT, SyslogLevelT> {
        return new LogContext(<LogContext<MessageT, SyslogLevelT>>JSON.parse(data.toString('utf-8'), this.option.reviver));
    }

    public setLevel(level: SyslogLevel) {
        this.option.level = level;
    }
}