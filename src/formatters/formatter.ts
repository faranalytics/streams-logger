import * as stream from "node:stream";
import { LogContext } from "../commons/log_context.js";
import { Node } from "@farar/nodes";
import { SyslogLevelT } from "../commons/syslog.js";
import { Config } from "../index.js";

export interface FormatterOptions<MessageInT, MessageOutT> {
  format: (record: LogContext<MessageInT, SyslogLevelT>) => Promise<MessageOutT> | MessageOutT
}

export class Formatter<MessageInT = string, MessageOutT = string> extends Node<LogContext<MessageInT, SyslogLevelT>, LogContext<MessageOutT, SyslogLevelT>> {

  constructor({ format }: FormatterOptions<MessageInT, MessageOutT>, streamOptions?: stream.TransformOptions) {
    super(new stream.Transform({
      ...Config.getDuplexOptions(true, true),
      ...streamOptions, ...{
        writableObjectMode: true,
        readableObjectMode: true,
        transform: (logContext: LogContext<MessageInT, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback) => {
          void (async () => {
            try {
              const message = await format(logContext);
              // eslint-disable-next-line @typescript-eslint/no-misused-spread
              const logContextOut = new LogContext<MessageOutT, SyslogLevelT>({ ...logContext, ...{ message: message } });
              callback(null, logContextOut);
            }
            catch (err) {
              if (err instanceof Error) {
                callback(err);
                Config.errorHandler(err);
              }
            }
          })();
        }
      }
    }));
  }
}