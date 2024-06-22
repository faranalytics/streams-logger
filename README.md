# *Streams* Logger

*Streams* is a type-safe logger for TypeScript and Node.js.

## Introduction

*Streams* is an intuitive type-safe logging facility built on native Node.js streams.  You can use the built-in logging components (e.g., Logger, Formatter, ConsoleHandler, RotatingFileHandler) for [common logging tasks](#usage) or implement your own logging [Transforms](https://github.com/faranalytics/graph-transform) to handle a wide range of logging scenarios.

### Features

- Type-safe logging graphs.
- *Streams* is based on the Node.js stream API; hence, it's ready for your Node.js stream-based resource.
- Consume any native Node.js Readable, Writable, Duplex, or Transform stream and add it to your graph.
- A graph API pattern for constructing sophisticated graph-like logging pipelines.
- Error propagation and selective termination of inoperable graph components.

## Table of Contents

- [Installation](#installation)
- [Concepts](#concepts)
- [Usage](#usage)
    - [Log to the Console and to a File](#log-to-the-console-and-to-a-file)
- [Examples](#examples)
    - [*An instance of logging "Hello, World!"*](#an-instance-of-logging-hello-world-example)
- [API](#api)
    - [The Logger Class](#the-logger-class)
    - [The Formatter Class](#the-formatter-class)
    - [The ConsoleHandler Class](#the-consolehandler-class)
    - [The RotatingFileHandler Class](#the-rotatingfilehandler-class)
- [Formatting](#formatting)
    - [Example Serializer](#example-serializer)
- [How-Tos](#how-tos)
    - [How to Implement a Custom *Streams* Transform](#how-to-implement-a-custom-streams-transform)
    - [How to Consume a Readable, Writable, Duplex, or Transform Stream](#how-to-consume-a-readable-writable-duplex-or-transform-native-nodejs-stream)
- [Backpressure](#backpressure)

## Installation

```bash
npm install streams-logger
```

## Concepts

### Transform

Logging is essentially a data transformation task.  When a string is logged to the console, for example, it typically undergoes a transformation step where relevant information (e.g., the timestamp, log level, process id, etc.) is added to the log message prior to it being printed.  Each data transformation step in a *Streams* logging graph is realized through a type-safe `Transform` implementation.  Each `Transform` in a data transformation graph consumes an input, transforms the data in some way, and optionally produces an output. Each component (e.g., Loggers, Formatters, Handlers, etc.) in a *Streams* logging graph *is a* `Transform`.

### Graph API Pattern

*Streams* uses a [graph API pattern](#connect-the-logger-to-the-formatter-and-connect-the-formatter-to-the-consolehandler-and-rotatingfilehandler) for constructing a logging graph. Each graph consists of a network of `Transforms` that together comprise the graph-like logging pipeline.

## Usage

In this hypothetical example you will log "Hello, World!" to the console and to a file.

### Log to the Console and to a File

#### Import the Logger, Formatter, ConsoleHandler and RotatingFileHandler, and SyslogLevel enum.

```ts
import { Logger, Formatter, ConsoleHandler, RotatingFileHandler, SyslogLevel } from 'streams-logger';
```

#### Create an instance of a Logger, Formatter, ConsoleHandler and RotatingFileHandler.
- The `Logger` is set to log at level `SyslogLevel.DEBUG`.  
- The `Formatter` constructor is passed a serialization function that will output a string containing the ISO time, the log level, the function name, the line number, the column number, and the log message.
- The `ConsoleHandler` will log the message to `process.stdout`.
- The `RotatingFileHandler` will log the message to the file `./message.log`.

```ts
const logger = new Logger({ level: SyslogLevel.DEBUG });
const formatter = new Formatter(async ({ message, name, level, func, url, line, col }) => (
    `${new Date().toISOString()}:${level}:${func}:${line}:${col}:${message}\n`
));
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });
const rotatingFileHandler = new RotatingFileHandler({ path: './message.log', level: SyslogLevel.DEBUG });
```

#### Connect the Logger to the Formatter and connect the Formatter to the ConsoleHandler and RotatingFileHandler.
*Streams* uses a graph-style API in order to construct a network of log Transforms.  Each component in a given network, in this case the `Logger`, the `Formatter`, and the `ConsoleHandler` and `RotatingFileHandler`, is a [Transform](https://github.com/faranalytics/graph-transform).
```ts
const log = logger.connect(
    formatter.connect(
        consoleHandler,
        rotatingFileHandler
    )
);
```

#### Log "Hello, World!" to the console and to the file `./message.log`.

```ts
function sayHello() {
    log.info('Hello, World!');
}

sayHello();
```

##### Output:
```bash
# ⮶date-time    function name⮷   column⮷ ⮶message
2024-06-12T00:10:15.894Z:INFO:sayHello:7:9:Hello, World!
#                        ⮴level       ⮴line number
```
## Examples

### *An instance of logging "Hello, World!"* <sup><sup>(example)</sup></sup>
Please see the [Usage](#usage) section above or the ["Hello, World!"](https://github.com/faranalytics/streams-logger/tree/main/examples/hello_world) example for a working implementation.

## API

### The Logger Class

**new streams-logger.Logger(options)**
- options `<LoggerOptions>`
    - level `<SyslogLevel>` The syslog compliant logger level.
    - name `<string>` An optional name for the `Logger`.
    - queueSizeLimit `<number>` Optionally specify a limit on how large (i.e., bytes) the message queue may grow while waiting for a stream to drain.

Construct a `<Logger<LogData, LogRecord<string, SyslogLevelT>>` that will propagate messages at the specified syslog level.

*public* **logger.level**
- `<SyslogLevel>`

The configured log level (e.g., `SyslogLevel.DEBUG`).

*public* **logger.connect(...transforms)**
- transforms `<Array<Transform<LogRecord<string, SyslogLevelT>, unknown>>`  Connect to an Array of `Transforms`.

Returns: `<Logger<LogData, LogRecord<string, SyslogLevelT>>`

*public* **logger.disconnect(...transforms)**
- transforms `<Array<Transform<LogRecord<string, SyslogLevelT>, unknown>>` Disconnect from an Array of `Transforms`.

Returns: `<Logger<LogData, LogRecord<string, SyslogLevelT>>`

*public* **logger.debug(message)**
- message `<string>` Write a DEBUG message to the `Logger`.

Returns: `<void>`

*public* **logger.info(message)**
- message `<string>` Write a INFO message to the `Logger`.

Returns: `<void>`

*public* **logger.notice(message)**
- message `<string>` Write a NOTICE message to the `Logger`.

Returns: `<void>`

*public* **logger.warn(message)**
- message `<string>` Write a WARN message to the `Logger`.

Returns: `<void>`

*public* **logger.error(message)**
- message `<string>` Write a ERROR message to the `Logger`.

Returns: `<void>`

*public* **logger.crit(message)**
- message `<string>` Write a CRIT message to the `Logger`.

Returns: `<void>`

*public* **logger.alert(message)**
- message `<string>` Write a ALERT message to the `Logger`.

Returns: `<void>`

*public* **logger.emerg(message)**
- message `<string>` Write a EMERG message to the `Logger`.

Returns: `<void>`

*public* **logger.setLevel(level)**
- level `<SyslogLevel>` A log level.

Set the log level.  Must be one of `SyslogLevel`.

### The Formatter Class

**new streams-logger.Formatter(transform)**
- transform `(record: LogRecord<string, SyslogLevelT>): Promise<string>` A function that will serialize the `LogRecord<string, SyslogLevelT>`.  Please see [Formatting](#formatting) for how to implement a serializer.

### The ConsoleHandler Class

**new streams-logger.ConsoleHandler()**

- options `<ConsoleHandlerTransformOtions>`
    - level `<SyslogLevel>` An optional log level.  **Default**: `SyslogLevel.WARN`

Use a ConsoleHandler in order to stream your messages to the console.

*public* **consoleHandler.setLevel(level)**
- level `<SyslogLevel>` A log level.

Set the log level.  Must be one of `SyslogLevel`.

### The RotatingFileHandler Class

**new streams-logger.RotatingFileHandler(options)**
- options `<RotatingFileHandlerOptions>`
    - path `<string>` 
    - rotations `<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>` An optional number of log rotations.
    - bytes `<number>` The size of the log file in MB. **Default**: `1e6`
    - encoding `<BufferEncoding>` An optional encoding. **Default**: `utf8`
    - mode `<number>` An optional mode. **Deafult**:`0o666`
    - level `<SyslogLevel>` An optional log level.  **Default**: `SyslogLevel.WARN`

Use a RotatingFileHandler in order to write your log messages to a file.

*public* **rotatingFileHandler.setLevel(level)**
- level `<SyslogLevel>` A log level.

Set the log level.  Must be one of `SyslogLevel`.

### The LogRecord Class

**new streams-logger.LogRecord(options)**
- options `<LoggerOptions>`
    - message `<string>` The logger message.
    - name `<string>` The name of the `Logger`.
    - level `<KeysUppercase<LevelT>` An uppercase string representing the log level.
    - depth `<number>` Used to specify which line of the stack trace to parse.
    - error `<Error>` The `Error` that was generated for parsing.

A `LogRecord` is instantiated each time a message is logged at an allowed level. It contains information about the process and environment at the time of the logging call.  A `LogRecord` is passed as the single argument to a `Formatter` [serialization function](#formatting).

*public* **logRecord.message**
- `<string>`
The logged message.

*public* **logRecord.name**
- `<string>`
The name of the `Logger`.

*public* **logRecord.level**
- `<DEBUG | INFO | NOTICE | WARN | ERROR | CRIT | ALERT | EMERG>`
An uppercase string representation of the level.

*public* **logRecord.func**
- `<string>`
The name of the function where the logging call took place.

*public* **logRecord.line**
- `<string>`
The line number of the logging call.

*public* **logRecord.col**
- `<string>`
The column of the logging call.

*public* **logRecord.isotime**
- `<string>`
The date and time in ISO format.

*public* **logRecord.pathname**
- `<string>`
The name of the module.

*public* **logRecord.path**
- `<string>`
The complete path of the module.

*public* **logRecord.pathdir**
- `<string>`
The directory part of the path.

*public* **logRecord.pathroot**
- `<string>`
The root of the path.

*public* **logRecord.pathbase**
- `<string>`
The module filename.

*public* **logRecord.pathext**
- `<string>`
The extension of the module.

*public* **logRecord.pid**
- `<string>`
The process identifier.

*public* **logRecord.env**
- `<NodeJS.ProcessEnv>`
The process environment.

*public* **logRecord.threadid**
- `<string>`
The thread identifier.

## Formatting

The `Logger` constructs and emits a `LogRecord<string, SyslogLevelT>` on each logged message.  At some point in a logging graph the properties of a LogRecord *may* undergo formatting and serialization.  This can be accomplished by creating an instance of a `Formatter` and passing in a custom [serialization function](#example-serializer) that accepts a `LogRecord` as its single argument.  The serialization function can construct a log message from the `LogRecord` properties.  In the concise example below this is accomplished by using a [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

### Example Serializer

In the following code excerpt, a serializer is implemented that logs:

1. The current time
2. The log level
3. The name of the function where the log event originated
4. The line number of the logging event
5. The column number of the logging event
6. The log message
7. A newline

The serializer function is passed to the constructor of a `Formatter`.  The `Logger` is connected to the `Formatter`.  The `Formatter` is connected to the `ConsoleHandler`.

```ts
const serializer = async ({ message, name, level, func, url, line, col }: LogRecord<string, SyslogLevelT>) => {
    return `${new Date().toISOString()}:${level}:${func}:${line}:${col}:${message}\n`;
}

const logger = new Logger({ name: 'main', level: SyslogLevel.DEBUG });
const formatter = new Formatter(serializer);
const consoleHandler = new ConsoleHandler();

const log = logger.connect(
    formatter.connect(
        consoleHandler
    )
)
```

This is an example of what a logged message will look like using the serializer defined above.

```bash
# ⮶date-time    function name⮷   column⮷ ⮶message
2024-06-12T00:10:15.894Z:INFO:sayHello:7:9:Hello, World!
#                        ⮴level       ⮴line number
```

## How-Tos

### How to Implement a Custom *Streams* Transform

*Streams* is built on the type-safe Graph-Transform graph API framework.  This means that any Graph-Transform `Transform` may be incorporated into your logging graph given that it meets the contextual type requirements.  Please see the [Graph-Transform](https://github.com/faranalytics/graph-transform) documentation for how to implement a custom `Transform`.

### How to Consume a Readable, Writable, Duplex, or Transform Native Node.js Stream

You can incorporate any Readable, Writable, Duplex, or Transform stream into your logging graph by passing the stream to the `Transform` constructor.  In this hypothetical example a type-safe `Transform` is constructed from a `net.Socket`.  The type variables are specified as `<Buffer, Buffer>`; the writable side of the stream consumes a `Buffer` and the readable side of the stream produces a `Buffer`. 

```ts
import * as net from 'node:net';
import { Transform } from 'streams-logger';

net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000);
const socket = net.createConnection({ port: 3000 });
await new Promise((r, e) => socket.once('connect', r).once('error', e));
const socketHandler = new Transform<Buffer, Buffer>(socket);
```

## Backpressure
*Streams* respects backpressure by queueing messages while the stream is draining.  You can set a hard limit on how large the message queue may grow by specifying a `queueSizeLimit` in the Logger constructor options.  If a `queueSizeLimit` is specified and if it is exceeded, the `Logger` will throw a `QueueSizeLimitExceededError`.