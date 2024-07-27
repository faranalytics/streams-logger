# _Streams_ Logger

Streams is a type-safe logger for TypeScript and Node.js applications.

## Introduction

<img align="right" src="./graph.png">

_Streams_ is an intuitive type-safe logger built on native Node.js streams. You can use the built-in logging components (e.g., the [Logger](#the-logger-class), [Formatter](#the-formatter-class), [Filter](#the-filter-class), [ConsoleHandler](#the-consolehandler-class), [RotatingFileHandler](#the-rotatingfilehandler-class), and [SocketHandler](#the-sockethandler-class)) for [common logging tasks](#usage) or implement your own logging [Node](https://github.com/faranalytics/nodes) to handle a wide range of logging scenarios. _Streams_ offers a graph-like API pattern for building sophisticated logging pipelines.

### Features

- A library of commonly used logging components: [Logger](#the-logger-class), [Formatter](#the-formatter-class), [Filter](#the-filter-class), [ConsoleHandler](#the-consolehandler-class), [RotatingFileHandler](#the-rotatingfilehandler-class), and [SocketHandler](#the-sockethandler-class).
- A rich selection of [contextual data](#log-context-data) (e.g., module name, function name, line number, etc.) for augmenting log messages.
- A type-safe graph-like API pattern for constructing sophisticated [logging graphs](#graph-api-pattern).
- Consume any native Node.js Readable, Writable, Duplex, or Transform stream and add it to your graph.
- Error handling and selective detachment of inoperable graph components.
- Log any type of message you choose - including [objects serialized to JSON](#object-json-logging).
- Import _Streams_ into your Node.js project or take advantage of the TypeScript type definitions.

## Table of Contents

- [Installation](#installation)
- [Concepts](#concepts)
- [Usage](#usage)
  - [Log to a File and the Console](#log-to-a-file-and-the-console)
- [Examples](#examples)
  - [_An Instance of Logging "Hello, World!"_](#an-instance-of-logging-hello-world-example)
  - [_Log to a File and the Console_](#log-to-a-file-and-the-console-example)
  - [_A Network Connected Streams Logging Graph_](#a-network-connected-streams-logging-graph-example)
  - [_Use Streams in a Node.js Project_](#use-streams-in-a-nodejs-project-example)
- [Formatting](#formatting)
  - [Log Context Properties](#log-context-properties)
  - [Example Formatter](#example-formatter)
- [API](#api)
  - [The Logger Class](#the-logger-class)
  - [The Formatter Class](#the-formatter-class)
  - [The Filter Class](#the-filter-class)
  - [The ConsoleHandler Class](#the-consolehandler-class)
  - [The RotatingFileHandler Class](#the-rotatingfilehandler-class)
  - [The SocketHandler Class](#the-sockethandler-class)
  - [The LogContext Class](#the-LogContext-class)
  - [The Streams Config Settings Object](#the-streams-config-settings-object)
  - [The SyslogLevel Enum](#the-sysloglevel-enum)
- [Object (JSON) Logging](#object-json-logging)
- [Using a Socket Handler](#using-a-socket-handler)
  - [Security](#security)
- [Hierarchical Logging](#hierarchical-logging)
- [How-Tos](#how-tos)
  - [How to implement a custom _Streams_ data transformation Node.](#how-to-implement-a-custom-streams-data-transformation-node)
  - [How to consume a Readable, Writable, Duplex, or Transform stream.](#how-to-consume-a-readable-writable-duplex-or-transform-nodejs-stream)
- [Tuning](#tuning)
  - [Tune the highWaterMark.](#tune-the-highwatermark)
  - [Disable the stack trace capture.](#disable-the-stack-trace-capture)
  - [Disconnect from root.](#disconnect-from-root)
- [Backpressure](#backpressure)
- [Performance](#performance)
- [Test](#test)

## Installation

```bash
npm install streams-logger
```

## Concepts

Logging is essentially a data transformation task. When a string is logged to the console, for example, it typically undergoes a transformation step where relevant information (e.g., the timestamp, log level, process id, etc.) is added to the log message prior to it being printed. Likewise, when data is written to a file or the console additional data transformations may take place e.g., serialization and representational transformation. _Streams_ accomplishes these data transformation tasks by means of a network of [`Node`](#node) instances that is constructed using a [graph-like API pattern](#graph-api-pattern).

### Node

Each data transformation step in a _Streams_ logging graph is realized through a [`Node`](https://github.com/faranalytics/nodes) implementation. Each `Node` in a data transformation graph consumes an input, transforms or filters the data in some way, and optionally produces an output. Each component (e.g., Loggers, Formatters, Filters, Handlers, etc.) in a _Streams_ logging graph _is a_ `Node`.

### Graph API Pattern

_Streams_ uses a graph-like API pattern for constructing a logging graph. Each graph consists of a network of `Node` instances that together comprise a graph logging pipeline. Please see the [Usage](#usage) or [Examples](#examples) for instructions on how to construct a _Streams_ data transformation graph.

## Usage

In this hypothetical example you will log "Hello, World!" to the console and to a file.

### Log to a File and the Console

#### 1. Import the Logger, Formatter, ConsoleHandler and RotatingFileHandler, and SyslogLevel enum.

```ts
import {
  Logger,
  Formatter,
  ConsoleHandler,
  RotatingFileHandler,
  SyslogLevel,
} from "streams-logger";
```

#### 2. Create an instance of a Logger, Formatter, ConsoleHandler and RotatingFileHandler.

- The `Logger` is set to log at level `SyslogLevel.DEBUG`.
- The `Formatter` constructor is passed a `format` function that will serialize data contained in the `LogContext` to a string containing the ISO time, the log level, the function name, the line number, the column number, and the log message.
- The `ConsoleHandler` will log the message to `process.stdout`.
- The `RotatingFileHandler` will log the message to the file `./message.log`.

```ts
const logger = new Logger({ level: SyslogLevel.DEBUG });
const formatter = new Formatter({
  format: async ({ isotime, message, name, level, func, url, line, col }) => {
    return `${isotime}:${level}:${func}:${line}:${col}:${message}\n`;
  },
});
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });
const rotatingFileHandler = new RotatingFileHandler({
  path: "./message.log",
  level: SyslogLevel.DEBUG,
});
```

#### 3. Connect the Logger to the Formatter and connect the Formatter to the ConsoleHandler and RotatingFileHandler.

_Streams_ uses a graph-like API pattern in order to construct a network of log Nodes. Each component in a given network, in this case the `Logger`, the `Formatter`, and the `ConsoleHandler` and `RotatingFileHandler`, _is a_ [Node](https://github.com/faranalytics/nodes).

```ts
const log = logger.connect(
  formatter.connect(
    consoleHandler, 
    rotatingFileHandler
    )
);
```

#### 4. Log "Hello, World!" to the console and to the file `./message.log`.

```ts
function sayHello() {
  log.info("Hello, World!");
};

sayHello();
```

##### Output:

```bash
# ⮶date-time    function name⮷   column⮷ ⮶message
2024-06-12T00:10:15.894Z:INFO:sayHello:7:9:Hello, World!
#                        ⮴level       ⮴line number
```

## Examples

### _An Instance of Logging "Hello, World!"_ <sup><sup>\</example\></sup></sup>

Please see the [Usage](#usage) section above or the ["Hello, World!"](https://github.com/faranalytics/streams-logger/tree/main/examples/hello_world) example for a working implementation.

### _Log to a File and the Console_ <sup><sup>\</example\></sup></sup>

Please see the [_Log to a File and the Console_](https://github.com/faranalytics/streams-logger/tree/main/examples/log_to_a_file_and_the_console) example that demonstrates how to log to a file and the console using different `Formatters`.

### _A Network Connected Streams Logging Graph_ <sup><sup>\</example\></sup></sup>

Please see the [_Network Connected Streams Logging Graph_](https://github.com/faranalytics/streams-logger/tree/main/examples/network_connected_logging_graph) example that demonstrates how to connect _Streams_ logging graphs over the network.

### _Use **Streams** in a Node.js Project_ <sup><sup>\</example\></sup></sup>
Please see the [_Use Streams in a Node.js Project_](https://github.com/faranalytics/streams-logger/tree/main/examples/use_streams_in_a_node_project) example that demonstrates how to use _Streams_ in a Node.js project.

## Formatting

The `Logger` constructs a `LogContext<MessageT, SyslogLevelT>` on each logged message. The properties of a `LogContext` _may_ undergo formatting and serialization using a `Formatter`. This can be accomplished by passing a `FormatterOptions` object, to the constructor of a `Formatter`, with its `format` property set to a custom [serialization](#example-formatter) or transformation function that accepts a `LogContext` as its single argument. The serialization function can construct a log message from the `LogContext` [properties](#log-context-data). In the concise [example](#example-formatter) below this is accomplished by using a [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

### Log Context Properties

_Streams_ provides a rich selection of contextual information with each logging call. This information is provided in a `LogContext` object that is passed as a single argument to the function assigned to the `format` property of the `FormatterOptions` object that is passed to the `Formatter` constructor. Please see the [example](#example-formatter) for instructions on how to incorporate contextual information into your logged message.

|Property|Description|Config Prerequisite|
|---|---|---|
|`col`| The column number of the logging call.|`captureStackTrace=true`|
|`env`| The process [environment](https://nodejs.org/dist/latest-v8.x/docs/api/process.html#process_process_env).||
|`func`| The name of the function where the logging call took place.|`captureStackTrace=true`|
|`isotime`| The ISO 8601 [representation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) of the time at which the logging call took place.|`captureISOTime=true`|
|`label`| Optional user specified label.||
|`level`| The `SyslogLevel` of the logging call.||
|`line`| The line number of the logging call.|`captureStackTrace=true`|
|`message`| The message of the logging call.||
|`metadata`| Optional user specified data.||
|`name`| The name of the logger.||
|`path`| The module path.|`captureStackTrace=true`|
|`pathbase`| The module filename.|`captureStackTrace=true`|
|`pathdir`| The directory part of the module path.|`captureStackTrace=true`|
|`pathext`| The extension of the module.|`captureStackTrace=true`|
|`pathname`| The name of the module.|`captureStackTrace=true`|
|`pathroot`| The root of the module.|`captureStackTrace=true`|
|`pid`| The process identifier.||
|`stack`| The complete stack trace.|`captureStackTrace=true`|
|`threadid`| The thread identifier.||
|`url`| The URL of the module.|`captureStackTrace=true`|

> **NB** For high throughput applications, you can improve performance by preventing some contextual information from being generated; you can set `Config.captureStackTrace` and `Config.captureISOTime` to `false`.  Please see [Tuning](#tuning) for instructions on how to disable contextual information.  

### Example Formatter

In the following code excerpt, a formatter is implemented that serializes a `LogContext` to:

1. The time of the logging call in ISO format
2. The log level
3. The name of the function where the log event originated
4. The line number of the log event
5. The column number of the log event
6. The log message
7. A newline

The `format` function is passed in a `FormatterOptions` object to the constructor of a `Formatter`. The `Logger` is connected to the `Formatter`. The `Formatter` is connected to the `ConsoleHandler`.

```ts
import { Logger, Formatter, ConsoleHandler, SyslogLevel } from "streams-logger";

const logger = new Logger({ name: "main", level: SyslogLevel.DEBUG });
const formatter = new Formatter({
  format: async ({ isotime, message, name, level, func, url, line, col }) => {
    return `${isotime}:${level}:${func}:${line}:${col}:${message}\n`;
  },
});
const consoleHandler = new ConsoleHandler();

const log = logger.connect(
  formatter.connect(
    consoleHandler
    )
);

function sayHello() {
    log.info('Hello, World!');
}

sayHello();
```

This is an example of what a logged message will look like using the `Formatter` defined above.

```bash
# ⮶date-time    function name⮷   column⮷ ⮶message
2024-06-12T00:10:15.894Z:INFO:sayHello:7:9:Hello, World!
#                        ⮴level       ⮴line number
```

## API

The _Streams_ API provides commonly used logging facilities (i.e., the [Logger](#the-logger-class), [Formatter](#the-formatter-class), [Filter](#the-filter-class), [ConsoleHandler](#the-consolehandler-class), [RotatingFileHandler](#the-rotatingfilehandler-class), and [SocketHandler](#the-sockethandler-class)). However, you can [consume any Node.js stream](#how-to-consume-a-readable-writable-duplex-or-transform-nodejs-stream) and add it to your logging graph.

### The Logger Class

**new streams-logger.Logger\<MessageT\>(options, streamOptions)**

- `<MessageT>` The type of the logged message. **Default: `<string>`**
- options `<LoggerOptions>`
  - level `<SyslogLevel>` The syslog logger level. **Default: `SyslogLevel.WARN`**
  - name `<string>` An optional name for the `Logger`.
  - parent `<Logger>` An optional parent `Logger`. Set this to `null` in order to disconnect from the root `Logger`.**Default: `streams-logger.root`**
  - queueSizeLimit `<number>` Optionally specify a limit on the number of log messages that may queue while waiting for a stream to drain. See [Backpressure](#backpressure).
  - captureStackTrace `<boolean>` Optionally specify if stack trace capturing is enabled. This setting will override the default.  **Default: `Config.captureStackTrace`**
  - captureISOTime `<boolean>` Optionally specify if capturing ISO time is enabled.  This setting will override the default.  **Default: `Config.captureISOTime`**
- streamOptions `<stream.TransformOptions>` Optional options to be passed to the stream.  You can use `TransformOptions` to set a `highWaterMark` on the `Logger`.

Use an instance of a Logger to propagate messages at the specified syslog level.

_public_ **logger.level**

- `<SyslogLevel>`

The configured log level (e.g., `SyslogLevel.DEBUG`).

_public_ **logger.connect(...nodes)**

- nodes `<Array<Node<LogContext<MessageT, SyslogLevelT>, unknown>>` Connect to an Array of `Nodes`.

Returns: `<Logger<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>>`

_public_ **logger.disconnect(...nodes)**

- nodes `<Array<Node<LogContext<MessageT, SyslogLevelT>, unknown>>` Disconnect from an Array of `Nodes`.

Returns: `<Logger<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>>`

_public_ **logger.debug(message, label)**

- message `<MessageT>` Write a DEBUG message to the `Logger`.
- label: `<string>` An optional label.

Returns: `<void>`

_public_ **logger.info(message, label)**

- message `<MessageT>` Write a INFO message to the `Logger`.
- label: `<string>` An optional label.

Returns: `<void>`

_public_ **logger.notice(message, label)**

- message `<MessageT>` Write a NOTICE message to the `Logger`.
- label: `<string>` An optional label.

Returns: `<void>`

_public_ **logger.warn(message, label)**

- message `<MessageT>` Write a WARN message to the `Logger`.
- label: `<string>` An optional label.

Returns: `<void>`

_public_ **logger.error(message, label)**

- message `<MessageT>` Write a ERROR message to the `Logger`.
- label: `<string>` An optional label.

Returns: `<void>`

_public_ **logger.crit(message, label)**

- message `<MessageT>` Write a CRIT message to the `Logger`.
- label: `<string>` An optional label.

Returns: `<void>`

_public_ **logger.alert(message, label)**

- message `<MessageT>` Write a ALERT message to the `Logger`.
- label: `<string>` An optional label.

Returns: `<void>`

_public_ **logger.emerg(message, label)**

- message `<MessageT>` Write a EMERG message to the `Logger`.
- label: `<string>` An optional label.

Returns: `<void>`

_public_ **logger.setLevel(level)**

- level `<SyslogLevel>` A log level.

Returns `<void>`

Set the log level. Must be one of `SyslogLevel`.

### The Formatter Class

**new streams-logger.Formatter\<MessageInT, MessageOutT\>(options, streamOptions)**

- `<MessageInT>` The type of the logged message. This is the type of the `message` property of the `LogContext` that is passed to the `format` function. **Default: `<string>`**
- `<MessageOutT>` The type of the output message. This is the return type of the `format` function. **Default: `<string>`**
- options
  - format `(record: LogContext<MessageInT, SyslogLevelT>): Promise<MessageOutT> | MessageOutT` A function that will format and serialize the `LogContext<MessageInT, SyslogLevelT>`. Please see [Formatting](#formatting) for how to implement a format function.
- streamOptions `<stream.TransformOptions>` Optional options to be passed to the stream.  You can use `TransformOptions` to set a `highWaterMark` on the `Formatter`.

Use a `Formatter` in order to specify how your log message will be formatted prior to forwarding it to the Handler(s). An instance of [`LogContext`](#the-LogContext-class) is created that contains information about the environment at the time of the logging call. The `LogContext` is passed as the single argument to `format` function.

_public_ **formatter.connect(...nodes)**

- nodes `<Array<Node<LogContext<MessageOutT, SyslogLevelT>, unknown>>` Connect to an Array of `Nodes`.

Returns: `<Formatter<LogContext<MessageInT, SyslogLevelT>, LogContext<MessageOutT, SyslogLevelT>>`

_public_ **formatter.disconnect(...nodes)**

- nodes `<Array<Node<LogContext<MessageOutT, SyslogLevelT>, unknown>>` Disconnect from an Array of `Nodes`.

Returns: `<Formatter<LogContext<MessageInT, SyslogLevelT>, LogContext<MessageOutT, SyslogLevelT>>`

### The Filter Class

**new streams-logger.Filter\<MessageT\>(options, streamOptions)**

- `<MessageT>` The type of the logged message. **Default: `<string>`**
- options
  - filter `(record: LogContext<MessageT, SyslogLevelT>): Promise<boolean> | boolean` A function that will filter the `LogContext<MessageT, SyslogLevelT>`. Return `true` in order to permit the message through; otherwise, return `false`.
- streamOptions `<stream.TransformOptions>` Optional options to be passed to the stream. You can use `TransformOptions` to set a `highWaterMark` on the `Filter`.

_public_ **filter.connect(...nodes)**

- nodes `<Array<Node<LogContext<MessageT, SyslogLevelT>, unknown>>` Connect to an Array of `Nodes`.

Returns: `<Filter<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>>`

_public_ **filter.disconnect(...nodes)**

- nodes `<Array<Node<LogContext<MessageT, SyslogLevelT>, unknown>>` Disconnect from an Array of `Nodes`.

Returns: `<Filter<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>>`

### The ConsoleHandler Class

**new streams-logger.ConsoleHandler\<MessageT\>(options, streamOptions)**

- `<MessageT>` The type of the logged message. **Default: `<string>`**
- options `<ConsoleHandlerOptions>`
  - level `<SyslogLevel>` An optional log level. **Default: `SyslogLevel.WARN`**
- streamOptions `<stream.TransformOptions>` Optional options to be passed to the stream. You can use `TransformOptions` to set a `highWaterMark` on the `ConsoleHandler`.

Use a `ConsoleHandler` in order to stream your messages to the console.

_public_ **consoleHandler.setLevel(level)**

- level `<SyslogLevel>` A log level.

Returns `<void>`

Set the log level. Must be one of `SyslogLevel`.

### The RotatingFileHandler Class

**new streams-logger.RotatingFileHandler\<MessageT\>(options, streamOptions)**

- `<MessageT>` The type of the logged message. **Default: `<string>`**
- options `<RotatingFileHandlerOptions>`
  - path `<string>` The path of the log file.
  - rotationLimit `<number>` An optional number of log rotations. **Default: `0`**
  - maxSize `<number>` The size of the log file in bytes that will initiate a rotation. **Default: `1e6`**
  - encoding `<BufferEncoding>` An optional encoding. **Default: `utf-8`**
  - mode `<number>` An optional mode. **Deafult: `0o666`**
  - level `<SyslogLevel>` An optional log level. **Default: `SyslogLevel.WARN`**
- streamOptions `<stream.WritableOptions>` Optional options to be passed to the stream. You can use `WritableOptions` to set a `highWaterMark` on the `RotatingFileHandler`.

Use a `RotatingFileHandler` in order to write your log messages to a file.

> **NB** For improved performance, the `RotatingFileHandler` maintains its own accounting of the log file size for purposes of file rotation; hence, it's important that out-of-band writes are not permitted on the same log file while it is operating on it.

_public_ **rotatingFileHandler.setLevel(level)**

- level `<SyslogLevel>` A log level.

Returns `<void>`

Set the log level. Must be one of `SyslogLevel`.

### The SocketHandler Class

**new streams-logger.SocketHandler\<MessageT\>(options, streamOptions)**

- `<MessageT>` The type of the logged message. **Default: `<string>`**
- options `<SocketHandlerOptions>`
  - socket `<Socket>` A `net.Socket` that will serve as a communication channel between this `SocketHandler` and the remote `SocketHandler`.
  - reviver `<(this: unknown, key: string, value: unknown) => unknown>` An optional reviver for `JSON.parse`.
  - replacer `<(this: unknown, key: string, value: unknown) => unknown>` An optional replacer for `JSON.stringify`.
  - space `<string | number>` An optional space specification for `JSON.stringify`.
- streamOptions `<stream.DuplexOptions>` Optional options to be passed to the stream. You can use `DuplexOptions` to set a `highWaterMark` on the `SocketHandler`.

Use a `SocketHandler` in order to connect _Streams_ graphs over the network. Please see the [_A Network Connected **Streams** Logging Graph_](#a-network-connected-streams-logging-graph-example) example for instructions on how to use a `SocketHandler` in order to connect _Streams_ logging graphs over the network.

_public_ **socketHandler.connect(...nodes)**

- nodes `<Array<Node<LogContext<MessageT, SyslogLevelT>, unknown>>` Connect to an Array of `Nodes`.

Returns: `<SocketHandler<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>>`

_public_ **socketHandler.disconnect(...nodes)**

- nodes `<Array<Node<LogContext<MessageT, SyslogLevelT>, unknown>>` Disconnect from an Array of `Nodes`.

Returns: `<SocketHandler<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>>`

_public_ **socketHandler.setLevel(level)**

- level `<SyslogLevel>` A log level.

Returns `<void>`

Set the log level. Must be one of `SyslogLevel`.

### The LogContext Class

**new streams-logger.LogContext\<MessageT, LevelT\>(options)**

- `<MessageT>` The type of the logged message. **Default: `<string>`**
- `<LevelT>` The type of the Level enum. **Default: `<SyslogLevelT>`**
- options `<LoggerOptions>`
  - message `<MessageT>` The logged message.
  - name `<string>` The name of the `Logger`.
  - level `<KeysUppercase<LevelT>` An uppercase string representing the log level.
  - depth `<number>` Used to specify which line of the stack trace to parse.
  - stack `<string>` An optional stack trace.

A `LogContext` is instantiated each time a message is logged at (or below) the level set on the `Logger`. It contains information about the process and environment at the time of the logging call. All _Streams_ Nodes take a `LogContext` as an input and emit a `LogContext` as an output.

The `LogContext` is passed as the single argument to the [format function](#formatting) of the `Formatter`; information about the environment can be extracted from the `LogContext` in order to format the logged message. The following properties will be available to the `format` function depending on the setting of `Config.captureStackTrace` and `Config.captureISOTime`. Please see the [Log Context Data](#log-context-data) table for details.

_public_ **logContext.col**

- `<string>`
  The column of the logging call. Available if `Config.captureStackTrace` is set to `true`.

_public_ **logContext.env**

- `<NodeJS.ProcessEnv>`
  The process environment.

_public_ **logContext.func**

- `<string>`
  The name of the function where the logging call took place. Available if `Config.captureStackTrace` is set to `true`.

_public_ **logContext.isotime**

- `<string>`
  The date and time in ISO format at the time of the logging call. Available if `Config.captureISOTime` is set to `true`.

_public_ **logContext.level**

- `<DEBUG | INFO | NOTICE | WARN | ERROR | CRIT | ALERT | EMERG>`
  An uppercase string representation of the level.

_public_ **logContext.line**

- `<string>`
  The line number of the logging call. Available if `Config.captureStackTrace` is set to `true`.

_public_ **logContext.message**

- `<string>`
  The logged message.

_public_ **logContext.metadata**

- `<unknown>`
  Optional user specified data.

_public_ **logContext.name**

- `<string>`
  The name of the `Logger`.

_public_ **logContext.path**

- `<string>`
  The complete path of the module. Available if `Config.captureStackTrace` is set to `true`.

_public_ **logContext.pathbase**

- `<string>`
  The module filename. Available if `Config.captureStackTrace` is set to `true`.

_public_ **logContext.pathext**

- `<string>`
  The extension of the module. Available if `Config.captureStackTrace` is set to `true`.

_public_ **logContext.pathdir**

- `<string>`
  The directory part of the module path. Available if `Config.captureStackTrace` is set to `true`.

_public_ **logContext.pathname**

- `<string>`
  The name of the module. Available if `Config.captureStackTrace` is set to `true`.

_public_ **logContext.pathroot**

- `<string>`
  The root of the path. Available if `Config.captureStackTrace` is set to `true`.

_public_ **logContext.pid**

- `<string>`
  The process identifier.

_public_ **logContext.threadid**

- `<string>`
  The thread identifier.

### The Streams Config Settings Object

The `Config` object is used to set default settings.  It can be used for performance [tuning](#tuning).

**Config.errorHandler** `<(err: Error, ...params: Array<unknown>) => void>` Set an error handler.  **Default: `console.error`**

**Config.captureISOTime** `<boolean>` Set this to `false` in order to disable capturing ISO time on each logging call.. **Default: `true`**

**Config.captureStackTrace** `<boolean>` Set this to `false` in order to disable stack trace capture on each logging call. **Default: `true`**

**Config.highWaterMark** `<number>` Set the `highWaterMark` for streams in Buffer mode. **Default: `node:stream.getDefaultHighWaterMark(false)`**

**Config.highWaterMarkObjectMode** `<number>` Set the `highWaterMark` for streams in objectMode. **Default: `node:stream.getDefaultHighWaterMark(true)`**

**Config.getDuplexOptions(writableObjectMode, readableObjectMode)**

- writableObjectMode `<boolean>` `true` for ObjectMode; `false` otherwise.
- readableObjectMode `<boolean>` `true` for ObjectMode; `false` otherwise.

Returns: `<stream.DuplexOptions>`

Use `Config.getDuplexOptions` when implementing a [custom _Streams_ data transformation Node](#how-to-implement-a-custom-streams-data-transformation-node).

**Config.getReadableOptions(readableObjectMode)**

- readableObjectMode `<boolean>` `true` for ObjectMode; `false` otherwise.

Returns: `<stream.ReadableOptions>`

Use `Config.getReadableOptions` when implementing a [custom _Streams_ data transformation Node](#how-to-implement-a-custom-streams-data-transformation-node).

**Config.getWritableOptions(writableObjectMode)**

- writableObjectMode `<boolean>` `true` for ObjectMode; `false` otherwise.

Returns: `<stream.WritableOptions>`

Use `Config.getWritableOptions` when implementing a [custom _Streams_ data transformation Node](#how-to-implement-a-custom-streams-data-transformation-node).

### The SyslogLevel Enum

**streams-logger.SyslogLevel\[Level\]**

- Level
  - EMERG = 0
  - ALERT = 1
  - CRIT = 2
  - ERROR = 3
  - WARN = 4
  - NOTICE = 5
  - INFO = 6
  - DEBUG = 7

Use `SyslogLevel` to set the level in the options passed to `Logger`, `Filter`, and Handler constructors.

## Object (JSON) Logging

_Streams_ logging facilities (e.g., Logger, Formatter, etc.) default to logging `string` messages; however, you can log any type of message you want by specifying your message type in the type parameter of the constructor. In the following example, a permissive interface is created named `Message`. The `Message` type is specified in the type parameter of the constructor of each `Node` (i.e., the Logger, Formatter, and ConsoleHandler). The `Formatter` is configured to input a `Message` and output a `string`; `Message` objects are serialized using `JSON.stringify`.

```ts
import { Logger, Formatter, ConsoleHandler, SyslogLevel } from "streams-logger";

interface Message {
  [key: string]: string | number;
}

const logger = new Logger<Message>({ level: SyslogLevel.DEBUG });
const formatter = new Formatter<Message, string>({
  format: async ({ isotime, message, level, func, line, col }) => {
    return `${isotime}:${level}:${func}:${line}:${col}:${JSON.stringify(
      message
    )}\n`;
  },
});
const consoleHandler = new ConsoleHandler<string>({ level: SyslogLevel.DEBUG });

const log = logger.connect(
    formatter.connect(
        consoleHandler
    )
);

(function sayHello() {
  log.warn({ greeting: "Hello, World!", prime: 57 });
})();
```

### Output

```bash
2024-07-06T03:19:28.767Z:WARN:sayHello:9:9:{"greeting":"Hello, World!","prime":57}
```

## Using a Socket Handler

_Streams_ uses Node.js streams for message propagation. Node.js represents sockets as streams; hence, sockets are a natural extension of a _Streams_ logging graph. For example, you may choose to use a `ConsoleHandler` locally and log to a `RotatingFileHandler` on a remote server. Please see the [_A Network Connected **Streams** Logging Graph_](#a-network-connected-streams-logging-graph-example) example for a working implementation.

### Security

The `SocketHandler` options take a socket instance as an argument. The `net.Server` that produces this socket may be configured however you choose. You can encrypt the data sent over TCP connections and authenticate clients by configuring your `net.Server` accordingly.

#### Configure your server to use TLS encryption.

TLS Encryption may be implemented using native Node.js [TLS Encryption](https://nodejs.org/docs/latest-v20.x/api/tls.html).

#### Configure your client to use TLS client certificate authentication.

TLS Client Certificate Authentication may be implemented using native Node.js [TLS Client Authentication](https://nodejs.org/docs/latest-v20.x/api/tls.html).

## Hierarchical Logging

_Streams_ supports hierarchical logging. By default every `Logger` instance is connected to the root `Logger` (`streams-logger.root`). However, you may optionally specify an antecedent other than `root` by assigning an instance of `Logger` to the `parent` property in the `LoggerOptions`. The antecedent of the root `Logger` is `null`.

You may capture logging events from other modules (_and your own_) by connecting a data handler `Node` (e.g., a `ConsoleHandler`) to the `streams-logger.root` `Logger`. E.g.,

```ts
import { Formatter, ConsoleHandler, SyslogLevel, root } from "streams-logger";

const formatter = new Formatter({
  format: async ({ isotime, message, name, level, func, url, line, col }) => {
    return `${isotime}:${level}:${func}:${line}:${col}:${message}\n`;
  },
});
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

root.connect(
    formatter.connect(
        consoleHandler
    )
);
```

## How-Tos

### How to implement a custom _Streams_ data transformation Node.

_Streams_ is built on the type-safe Nodes graph API framework. This means that any Nodes `Node` may be incorporated into your logging graph given that it meets the contextual type requirements. In order to implement a _Streams_ data transformation `Node`, subclass the `Node` class, and provide the appropriate _Streams_ defaults to the stream constructor.

For example, the somewhat contrived `LogContextToBuffer` implementation transforms the `message` contained in a `LogContext` to a `Buffer`; the graph pipeline streams the message to `process.stdout`.

> **NB** In this example, `writableObjectMode` is set to `true` and `readableObjectMode` is set to `false`; hence, the Node.js stream implementation will handle the input as a `object` and the output as an `Buffer`. It's important that `writableObjectMode` and `readableObjectMode` accurately reflect the input and output types of your Node.

```ts
import * as stream from "node:stream";
import { Logger, Node, Config, LogContext, SyslogLevelT } from "streams-logger";

export class LogContextToBuffer extends Node<
  LogContext<string, SyslogLevelT>,
  Buffer
> {
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
            callback(null, Buffer.from(chunk.message, this.encoding));
          },
        },
      })
    );
  }
}

const log = new Logger({ name: "main" });
const logContextToBuffer = new LogContextToBuffer();
const console = new Node<Buffer, never>(process.stdout);

log.connect(
    logContextToBuffer.connect(
        console
    )
);

log.warn("Hello, World!");
```

#### Output

```bash
Hello, World!
```

### How to consume a Readable, Writable, Duplex, or Transform Node.js stream.

You can incorporate any Readable, Writable, Duplex, or Transform stream into your logging graph, given that it meets the contextual type requirements, by passing the stream to the `Node` constructor. In this hypothetical example a type-safe `Node` is constructed from a `net.Socket`. The type variables are specified as `<Buffer, Buffer>`; the writable side of the stream consumes a `Buffer` and the readable side of the stream produces a `Buffer`.

```ts
import * as net from "node:net";
import { once } from "node:events";
import { Node } from "streams-logger";

net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000);
const socket = net.createConnection({ port: 3000 });
await once(socket, "connect");
const socketHandler = new Node<Buffer, Buffer>(socket);
```

## Tuning

**Depending on your requirements, the defaults may be fine.** However, for high throughput applications you may choose to adjust the `highWaterMark`, disconnect your `Logger` from the root `Logger`, and/or disable stack trace capturing.

### Tune the `highWaterMark`.

_Streams_ `Node` implementations use the native Node.js stream API for message propagation. You have the option of tuning the Node.js stream `highWaterMark` to your specific needs - keeping in mind memory constraints. You can set a `highWaterMark` using [`Config.highWaterMark`](#the-streams-config-settings-object) and [`Config.highWaterMarkObjectMode`](#the-streams-config-settings-object) that will apply to Nodes in the _Streams_ library. Alternatively, the `highWaterMark` can be set in the constructor of each `Node`; please see the [API](#api) for instructions on how to do this.

In this example, the `highWaterMark` of ObjectMode streams and Buffer mode streams is artificially set to `1e6` objects and `1e6` bytes.

```ts
import * as streams from "streams-logger";

streams.Config.highWaterMark = 1e6;
streams.Config.highWaterMarkObjectMode = 1e6;
```
> Please see the [API](#api) for more information on [`Config`](#the-streams-config-settings-object) object settings.

### Disable stack trace capture.

Another optional setting that you can take advantage of is to turn off stack trace capture. Stack trace capture can be disabled globally using the _Streams_ configuration settings object i.e., [`Config.captureStackTrace`](#the-streams-config-settings-object). Alternatively, you may disable stack trace capturing in a specific `Logger` by setting the `captureStackTrace` property of the `LoggerOptions` to `false`.

Turning off stack trace capture will disable some of the information (e.g., function name and line number) that is normally contained in the `LogContext` object that is passed to the `format` function of a `Formatter`.

```ts
import * as streams from "streams-logger";

streams.Config.captureStackTrace = false;
```
> Please see the [API](#api) for more information on [`Config`](#the-streams-config-settings-object) object settings.

### Disconnect from root.

You can optionally disconnect your `Logger` from the root `Logger` or a specified antecedent. This will prevent message propagation to the root logger, which will provide cost savings and isolation. E.g.,

```ts
import * as streams from 'streams-logger';
...
const log = logger.connect(
    formatter.connect(
        consoleHandler
    )
);
log.disconnect(streams.root);
```

## Backpressure

_Streams_ respects backpressure by queueing messages while the stream is draining. You can set a limit on how large the message queue may grow by specifying a `queueSizeLimit` in the Logger constructor options. If a `queueSizeLimit` is specified and if it is exceeded, the `Logger` will throw a `QueueSizeLimitExceededError`.

**For typical logging applications setting a `queueSizeLimit` isn't necessary.** However, if an uncooperative stream peer reads data at a rate that is slower than the rate that data is written to the stream, data may buffer until memory is exhausted. By setting a `queueSizeLimit` you can effectively respond to subversive stream peers and disconnect offending Nodes in your graph.

If you have a _cooperating_ stream that is backpressuring, you can either set a default `highWaterMark` appropriate to your application or increase the `highWaterMark` on the specific stream in order to mitigate drain events.

## Performance

_Streams_ is a highly customizable logger that performs well on a wide range of logging tasks. It is a good choice for both error logging and high throughput logging. It strictly adheres to the Node.js public API contract and common conventions. This approach comes with trade-offs; however, it ensures stability and portability while still delivering a performant logging experience.

>Please see [Tuning](#tuning) for how to configure the logging graph for high throughput applications.

## Test

### Test variations on logger functionality.

#### Clone the repository and change directory into the root of the repository.
```bash
git clone https://github.com/faranalytics/streams-logger.git
cd streams-logger
```
#### Install dependencies.
```bash
npm install && npm update
```
#### Run the tests.
```bash
npm test verbose=false
```
