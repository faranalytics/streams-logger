# Streams Logger

Streams is a type-safe logger for TypeScript and Node.

## Introduction

Streams offers an intuitive type-safe logging facility built on native Node streams.  You can use the built-in logging components (e.g., Logger, Formatter, ConsoleHandler) for [common logging tasks](#usage) or implement your own logging [Transforms](https://github.com/faranalytics/graph-transform) in order to handle a wide range of logging scenarios.

### Features

- Type-safe logging graphs.
- Consume any native Node Writable or Readable stream and add it to your graph.
- A graph API pattern for constucting sophisticated logging graphs.
- Error propagation and selective termination of inoperable graph components.

## Table of Contents

- [Installation](#installation)
- [Concepts](#concepts)
- [Usage](#usage)
- [Examples](#examples)
- [API](#api)
- [How to Implement a Transform](#how-to-implement-a-transform)
- [How to Consume a stream.Duplex](#how-to-consume-a-streamduplex)
- [Backpressure](#backpressure)

## Installation

```bash
npm install streams-logger
```

## Concepts

### Transform

The Streams framework is based on the idea that logging is essentially a data transformation task.  When a string is logged to the console, for example, it typically undergoes a transformation step where relevant information (e.g., the timestamp, log level, etc.) is added to the log message prior to it being printed.  These transformation steps are realized through a type-safe `Transform` implementation. 

### Graph API Pattern

Streams uses a [graph API pattern](#connect-the-logger-to-the-formatter-and-connect-the-formatter-to-the-consolehandler) for constructing a logger. Each graph consists of a network of `Transforms` that together comprise the logging pipeline.

## Usage

In this hypothetical example you will log "Hello, World!" to the console.

### Import the Logger, Formatter, ConsoleHandler, and SyslogLevel enum.

```ts
import { Logger, Formatter, ConsoleHandler, SyslogLevel } from 'streams-logger';
```

### Create an instance of a Logger, Formatter, and ConsoleHandler.
- The `Logger` will be set to log at level `SyslogLevel.INFO`.  
- The `Formatter` will be passed a serialization function that will output a string containing the ISO time, the log level, the function name, the line number, the column number, and the log message.
- The `ConsoleHandler` will log the message to `process.stdout`.

```ts
const logger = new Logger({ level: SyslogLevel.INFO });
const formatter = new Formatter(async ($) => `${new Date().toISOString()}:${$.level}:${$.func}:${$.line}:${$.col}:${$.message}\n`);
const consoleHandler = new ConsoleHandler();
```

### Connect the Logger to the Formatter and connect the Formatter to the ConsoleHandler.
Streams uses a graph-style API in order to construct a network of log Transforms.  Each component in a given network, in this case the `Logger`, the `Formatter`, and the `ConsoleHandler`, is a [Transform](#transform).
```ts
const log = logger.connect(
    formatter.connect(
        consoleHandler
    )
);
```

### Log "Hello, World!" to the console.

```ts
function sayHello() {
    log.info('Hello, World!');
}

sayHello();
```

#### Output:
```bash
2024-06-12T00:10:15.894Z:INFO:sayHello:7:9:Hello, World!
```
## Examples

### *An instance of "Hello, World!"* <sup><sup>(example)</sup></sup>
Please see the [Usage](#usage) section above or the ["Hello, World!"](https://github.com/faranalytics/streams-logger/tree/main/examples/hello_world) example for a working implementation.

## API

### The Logger Class

**new streams-logger.Logger(options)**
- options `<LoggerOptions>`
    - level `<SyslogLevel>` The syslog compliant logger level.
    - name `<string>` An optional name for the `Logger`.

Constuct a `<Logger<LogData, LogRecord<string, SyslogLevelT>>` that will propogate messages at the specified syslog level.

**logger.connect(...transforms)**
- transforms `<Array<Transform<LogRecord<string, SyslogLevelT>, unknown>>`  Connect to `Transforms` in the array of `Transforms`.

Returns: `<Logger<LogData, LogRecord<string, SyslogLevelT>>`

**logger.disconnect(...transforms)**
- transforms `<Array<Transform<LogRecord<string, SyslogLevelT>, unknown>>` Disconnect `Transforms` in the array `Transforms`.

Returns: `<Logger<LogData, LogRecord<string, SyslogLevelT>>`

**logger.debug(message: string)**
- message `<string>` Write a DEBUG message to the `Logger`.

Returns: `<void>`

**logger.info(message: string)**
- message `<string>` Write a INFO message to the `Logger`.

Returns: `<void>`

**logger.notice(message: string)**
- message `<string>` Write a NOTICE message to the `Logger`.

Returns: `<void>`

**logger.warn(message: string)**
- message `<string>` Write a WARN message to the `Logger`.

Returns: `<void>`

**logger.error(message: string)**
- message `<string>` Write a ERROR message to the `Logger`.

Returns: `<void>`

**logger.crit(message: string)**
- message `<string>` Write a CRIT message to the `Logger`.

Returns: `<void>`

**logger.alert(message: string)**
- message `<string>` Write a ALERT message to the `Logger`.

Returns: `<void>`

**logger.emerg(message: string)**
- message `<string>` Write a EMERG message to the `Logger`.

Returns: `<void>`

### The Formatter Class

**new streams-logger.Formatter(transform)**
- transform `(record: LogRecord<string, SyslogLevelT>): Promise<string>` A function that will serialize the `LogRecord<string, SyslogLevelT>`.  Please see [Formatting](#formatting) for how to implement a serializer.

### The ConsoleHandler Class
**new streams-logger.ConsoleHandler()**

Use this class in order to stream your messages to console.

### The LogRecord Class
**new streams-logger.LogRecord(options)**
- options `<LoggerOptions>`
    - message `<string>` The logger message.
    - name `<string>` The name of the `Logger`.
    - level `<KeysUppercase<LevelT>` An uppercase string representing the log level.
    - depth `<number>` Used to specify the which line of the stack trace to parse.
    - error `<Error>` The `Error` that was generated for parsing.

**logRecord.message**
- `<string>`
The logged message.

**logRecord.name**
- `<string>`
The name of the `Logger`.

**logRecord.level**
- `<DEBUG | INFO | NOTICE | WARN | ERROR | CRIT | ALERT | EMERG>`
An upper case string representation of the level.

**logRecord.func**
- `<string>`
The name of the function where the logging event took place.

**logRecord.line**
- `<string>`
The line number of the logging event.

**logRecord.col**
- `<string>`
The column of the logging event.

## Formatting

The `Logger` constructs and emits a `LogRecord<string, SyslogLevelT>` on each logged message.  At some point in a logging graph the LogRecord *may* be serialized into a string.  This can be accomplished by creating an instance of a `Formatter` and passing in a custom [serialization function](#example-serializer) that accepts a `LogRecord` as its single argument.  The serialization function can formulate a log message by constructing a [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) from the `LogRecord` properties.  

### Log Record Properties
A `LogRecord<string, SyslogLevelT>` object is passed to the serializer that contains the following properties.

- message `<string>` The logged message.
- name `<string>` The name of the `Logger`.
- level `<DEBUG | INFO | NOTICE | WARN | ERROR | CRIT | ALERT | EMERG>` An upper case string representation of the level.
- func `<string>` The name of the function.
- url `<string>`  The stacktrace URL.
- line `<string>` The line number of the logging event.
- col `<string>` The column number of the logging event.

### Example Serializer

In the following code excerpt, a serializer is implemented that logs:

1. the current time
2. the log level
3. the name of the function where the log event originated
4. the line number of the logging event
5. the column number of the logging event
6. the log message
7. a newline

The serializer function is passed to the constructor of a `Formatter` and the `Formatter` is incorporated into the logging graph.

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

This is an example of what a logged message will look like using the serilizer defined above.

```bash
# ⮶date-time         function name⮷   column⮷ ⮶message
2024-06-12T00:10:15.894Z:INFO:sayHello:7:9:Hello, World!
#                        ⮴level       ⮴line number
```

## How to Implement a streams-logger.Transform

Streams is built on the type-safe Graph-Transform graph API framework.  This means that any Graph-Transform `Transform` may be incorporated into your logging graph given that it meets the contextual type requirements.  Please see the [Graph-Transform](https://github.com/faranalytics/graph-transform) documentation for how to implement a custom `Transform`.

## How to Consume a Readable, Writable, Duplex, or Transform Stream

You can incorporate any Readable, Writable, Duplex or Transform streams into your logging graph by passing the stream to the `Transform` constructor.  In this hypothetical example a type-safe `Transform` is constructed from a `net.Socket`.  The type variables are specified as `<Buffer, Buffer>`; the writable side of the stream consumes a `Buffer` and the readable side of the stream produces a `Buffer`. 

```ts
net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000);
const socket = net.createConnection({ port: 3000 });
await new Promise((r, e) => socket.once('connect', r).once('error', e));
const socketHandler = new Transform<Buffer, Buffer>(socket);
```

# Backpressure