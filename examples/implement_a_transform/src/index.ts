import * as stream from "node:stream";
import { Logger, Node, Config, LogContext, SyslogLevelT } from "streams-logger";

export class LogContextToBuffer extends Node<LogContext<string, SyslogLevelT>, Buffer> {
  public encoding: NodeJS.BufferEncoding = "utf-8";

  constructor(streamOptions?: stream.TransformOptions) {
    super(
      new stream.Transform({
        ...Config.getDuplexOptions(true, false),
        ...streamOptions,
        ...{
          writableObjectMode: true,
          readableObjectMode: false,
          transform: (
            chunk: LogContext<string, SyslogLevelT>,
            encoding: BufferEncoding,
            callback: stream.TransformCallback
          ) => {
            try {
              if (chunk.message) {
                callback(null, Buffer.from(chunk.message, this.encoding));
              } else {
                callback();
              }
            } catch (err) {
              if (err instanceof Error) {
                callback(err);
              }
            }
          },
        },
      })
    );
  }
}

const log = new Logger<string>({ name: "main" });
const logContextToBuffer = new LogContextToBuffer();
const console = new Node<Buffer, never>(process.stdout);

log.connect(logContextToBuffer.connect(console));

log.warn("Hello, World!");
