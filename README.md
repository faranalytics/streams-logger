# *Streams* Logger

Streams is a type-safe logger for TypeScript and Node.js applications.

## Introduction

<img align="right" src="./graph.png">

*Streams* is an intuitive type-safe logging facility built on native Node.js streams.  You can use the built-in logging components (e.g., the [Logger](#the-logger-class), [Formatter](#the-formatter-class), [Filter](#the-filter-class), [ConsoleHandler](#the-consolehandler-class), [RotatingFileHandler](#the-rotatingfilehandler-class), and [SocketHandler](#the-sockethandler-class)) for [common logging tasks](#usage) or implement your own logging [Node](https://github.com/faranalytics/@farar/nodes) to handle a wide range of logging scenarios. *Streams* offers a graph-like API pattern for building sophisticated logging pipelines.

### Features

- A library of commonly used logging components: [Logger](#the-logger-class), [Formatter](#the-formatter-class), [Filter](#the-filter-class), [ConsoleHandler](#the-consolehandler-class), [RotatingFileHandler](#the-rotatingfilehandler-class), and [SocketHandler](#the-sockethandler-class).
- A rich selection of [contextual data](#log-context-data) (e.g., module name, function name, line number, etc.) for augmenting log messages.
- A type-safe graph-like API pattern for constructing sophisticated [logging graphs](#graph-api-pattern).
- Consume any native Node.js Readable, Writable, Duplex, or Transform stream and add it to your graph.
- Error propagation and selective termination of inoperable graph components.
- Log any type of message you choose - including [objects serialized to JSON](#object-json-logging). 
- Import *Streams* into your Node.js project or take advantage of the TypeScript type definitions. 

## Table of Contents

- [Installation](#installation)
- [Concepts](#concepts)
- [Usage](#usage)
    - [Log to a File and the Console](#log-to-a-file-and-the-console)
- [Examples](#examples)
    - [*An Instance of Logging "Hello, World!"*](#an-instance-of-logging-hello-world-example)
    - [*Log to a File and the Console*](#log-to-a-file-and-the-console-example)
    - [*A Network Connected **Streams** Logging Graph*](#a-network-connected-streams-logging-graph-example)
- [Log Context Data](#log-context-data)
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
- [Formatting](#formatting)
    - [Example Serializer](#example-serializer)
- [Object (JSON) Logging](#object-json-logging)
- [Using a Socket Handler](#using-a-socket-handler)
    - [Security](#security)
- [Hierarchical Logging](#hierarchical-logging)
- [How-Tos](#how-tos)
    - [How to implement a custom *Streams* data transformation Node.](#how-to-implement-a-custom-streams-data-transformation-node)
    - [How to consume a Readable, Writable, Duplex, or Transform stream.](#how-to-consume-a-readable-writable-duplex-or-transform-nodejs-stream)
- [Tuning](#tuning)
    - [Tune the highWaterMark.](#tune-the-highwatermark)
    - [Disable the stack trace capture.](#disable-the-stack-trace-capture)
    - [Disconnect from root.](#disconnect-from-root)
- [Backpressure](#backpressure)

## Installation

```bash
npm install streams-logger
```

## Concepts

Logging is essentially a data transformation task.  When a string is logged to the console, for example, it typically undergoes a transformation step where relevant information (e.g., the timestamp, log level, process id, etc.) is added to the log message prior to it being printed.  Likewise, when data is written to a file or the console additional data transformations may take place e.g., serialization and representational transformation.  *Streams* accomplishes these data transformation tasks by means of a network of [`Node`](#node) instances (i.e., a data transformation graph) that is constructed using a [graph-like API pattern](#graph-api-pattern).

### Node

 Each data transformation step in a *Streams* logging graph is realized through a `Node` implementation.  Each `Node` in a data transformation graph consumes an input, transforms or filters the data in some way, and optionally produces an output. Each component (e.g., Loggers, Formatters, Filters, Handlers, etc.) in a *Streams* logging graph *is a* `Node`.

### Graph API Pattern

*Streams* uses a graph-like API pattern for constructing a logging graph. Each graph consists of a network of `Node` instances that together comprise a graph logging pipeline. Please see the [Usage](#usage) or [Examples](#examples) for instructions on how to construct a *Streams* data transformation graph.

## Usage

In this hypothetical example you will log "Hello, World!" to the console and to a file.

### Log to a File and the Console

#### 1. Import the Logger, Formatter, ConsoleHandler and RotatingFileHandler, and SyslogLevel enum.

```ts
import { Logger, Formatter, ConsoleHandler, RotatingFileHandler, SyslogLevel } from 'streams-logger';
```

#### 2. Create an instance of a Logger, Formatter, ConsoleHandler and RotatingFileHandler.

- The `Logger` is set to log at level `SyslogLevel.DEBUG`.  
- The `Formatter` constructor is passed a `format` function that will serialize data contained in the `LogContext` to a string containing the ISO time, the log level, the function name, the line number, the column number, and the log message.
- The `ConsoleHandler` will log the message to `process.stdout`.
- The `RotatingFileHandler` will log the message to the file `./message.log`.

```ts
const logger = new Logger({ level: SyslogLevel.DEBUG });
const formatter = new Formatter({
    format: async ({ isotime, message, name, level, func, url, line, col }) => (
        `${isotime}:${level}:${func}:${line}:${col}:${message}\n`
    )
});
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });
const rotatingFileHandler = new RotatingFileHandler({ path: './message.log', level: SyslogLevel.DEBUG });
```

#### 3. Connect the Logger to the Formatter and connect the Formatter to the ConsoleHandler and RotatingFileHandler.
*Streams* uses a graph-like API pattern in order to construct a network of log Nodes.  Each component in a given network, in this case the `Logger`, the `Formatter`, and the `ConsoleHandler` and `RotatingFileHandler`, is a [Node](https://github.com/faranalytics/@farar/nodes).
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

### *An Instance of Logging "Hello, World!"* <sup><sup>\</example\></sup></sup>
Please see the [Usage](#usage) section above or the ["Hello, World!"](https://github.com/faranalytics/streams-logger/tree/main/examples/hello_world) example for a working implementation.

### *Log to a File and the Console* <sup><sup>\</example\></sup></sup>
Please see the [*Log to a File and the Console*](https://github.com/faranalytics/streams-logger/tree/main/examples/log_to_a_file_and_the_console) example that demonstrates how to log to a file and the console using different `Formatters`.

### *A Network Connected **Streams** Logging Graph* <sup><sup>\</example\></sup></sup>
Please see the [*Network Connected **Streams** Logging Graph*](https://github.com/faranalytics/streams-logger/tree/main/examples/network_connected_logging_graph) example that demonstrates how to connect *Streams* logging graphs over the network.

## Log Context Data
*Streams* provides a rich selection of contextual information with each logging call.  This information is provided in a `LogContext` object that is passed as a single argument to the function assigned to the `format` property of the `FormatterOptions` object that is passed to the `Formatter` constructor.  You can disable generation of some contextual information by setting `Config.captureStackTrace` and `Config.captureISOTime` to `false`.  Please see [Formatting](#formatting) for instructions on how to incorporate contextual information into your logged message.
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
## API

The *Streams* API provides commonly used logging facilities (i.e., the [Logger](#the-logger-class), [Formatter](#the-formatter-class), [Filter](#the-filter-class), [ConsoleHandler](#the-consolehandler-class), [RotatingFileHandler](#the-rotatingfilehandler-class), and [SocketHandler](#the-sockethandler-class)).  However, you can [consume any Node.js stream](#how-to-consume-a-readable-writable-duplex-or-transform-nodejs-stream) and add it to your logging graph.

### The Logger Class

**new streams-logger.Logger\<MessageT\>(options, streamOptions)**
- `<MessageT>` The type of the logged message. **Default: `<string>`**
- options `<LoggerOptions>`
    - level `<SyslogLevel>` The syslog logger level. **Default: `SyslogLevel.WARN`**
    - name `<string>` An optional name for the `Logger`.
    - parent `<Logger>` An optional parent `Logger`.  **Default: `streams-logger.root`**
    - queueSizeLimit `<number>` Optionally specify a limit on the number of log messages that may queue while waiting for a stream to drain.  See [Backpressure](#backpressure).
    - captureStackTrace `<boolean>` Optionally specify if stack trace capturing is enabled.  This setting can be overridden by the *Streams* configuration setting `Config.captureStackTrace`. **Default: `true`**
    - captureISOTime `<boolean>` Optionally specify if capturing ISO time is enabled. This setting can be overridden by the *Streams* configuration setting `Config.captureISOTime`. **Default: `true`**
- streamOptions `<stream.TransformOptions>` Optional options to be passed to the stream.

Use an instance of a Logger to propagate messages at the specified syslog level.

*public* **logger.level**
- `<SyslogLevel>`

The configured log level (e.g., `SyslogLevel.DEBUG`).

*public* **logger.connect(...nodes)**
- nodes `<Array<Node<LogContext<MessageT, SyslogLevelT>, unknown>>`  Connect to an Array of `Nodes`.

Returns: `<Logger<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>>`

*public* **logger.disconnect(...nodes)**
- nodes `<Array<Node<LogContext<MessageT, SyslogLevelT>, unknown>>` Disconnect from an Array of `Nodes`.

Returns: `<Logger<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>>`

*public* **logger.debug(message, label)**
- message `<MessageT>` Write a DEBUG message to the `Logger`.
- label: `<string>` An optional label.

Returns: `<void>`

*public* **logger.info(message)**
- message `<MessageT>` Write a INFO message to the `Logger`.
- label: `<string>` An optional label.

Returns: `<void>`

*public* **logger.notice(message)**
- message `<MessageT>` Write a NOTICE message to the `Logger`.
- label: `<string>` An optional label.

Returns: `<void>`

*public* **logger.warn(message)**
- message `<MessageT>` Write a WARN message to the `Logger`.
- label: `<string>` An optional label.

Returns: `<void>`

*public* **logger.error(message)**
- message `<MessageT>` Write a ERROR message to the `Logger`.
- label: `<string>` An optional label.

Returns: `<void>`

*public* **logger.crit(message)**
- message `<MessageT>` Write a CRIT message to the `Logger`.
- label: `<string>` An optional label.

Returns: `<void>`

*public* **logger.alert(message)**
- message `<MessageT>` Write a ALERT message to the `Logger`.
- label: `<string>` An optional label.

Returns: `<void>`

*public* **logger.emerg(message)**
- message `<MessageT>` Write a EMERG message to the `Logger`.
- label: `<string>` An optional label.

Returns: `<void>`

*public* **logger.setLevel(level)**
- level `<SyslogLevel>` A log level.

Set the log level.  Must be one of `SyslogLevel`.

### The Formatter Class

**new streams-logger.Formatter\<MessageInT, MessageOutT\>(options, streamOptions)**
- `<MessageInT>` The type of the logged message.  This is the type of the `message` property of the `LogContext` that is passed to the `format` function. **Default: `<string>`**
- `<MessageOutT>` The type of the output message.  This is the return type of the `format` function. **Default: `<string>`**
- options
    - format `(record: LogContext<MessageInT, SyslogLevelT>): Promise<MessageOutT> | MessageOutT` A function that will format and serialize the `LogContext<MessageInT, SyslogLevelT>`.  Please see [Formatting](#formatting) for how to implement a format function.
- streamOptions `<stream.TransformOptions>` Optional options to be passed to the stream.

Use a `Formatter` in order to specify how your log message will be formatted prior to forwarding it to the Handler(s).  An instance of [`LogContext`](#the-LogContext-class) is created that contains information about the environment at the time of the logging call.  The `LogContext` is passed as the single argument to `format` function.

*public* **formatter.connect(...nodes)**
- nodes `<Array<Node<LogContext<MessageOutT, SyslogLevelT>, unknown>>`  Connect to an Array of `Nodes`.

Returns: `<Formatter<LogContext<MessageInT, SyslogLevelT>, LogContext<MessageOutT, SyslogLevelT>>`

*public* **formatter.disconnect(...nodes)**
- nodes `<Array<Node<LogContext<MessageOutT, SyslogLevelT>, unknown>>` Disconnect from an Array of `Nodes`.

Returns: `<Formatter<LogContext<MessageInT, SyslogLevelT>, LogContext<MessageOutT, SyslogLevelT>>`

### The Filter Class

**new streams-logger.Filter\<MessageT\>(options, streamOptions)**
- `<MessageT>` The type of the logged message. **Default: `<string>`**
- options
    - filter `(record: LogContext<MessageT, SyslogLevelT>): Promise<boolean> | boolean` A function that will filter the `LogContext<MessageT, SyslogLevelT>`.  Return `true` in order to permit the message through; otherwise, return `false`.
- streamOptions `<stream.TransformOptions>` Optional options to be passed to the stream.

*public* **filter.connect(...nodes)**
- nodes `<Array<Node<LogContext<MessageT, SyslogLevelT>, unknown>>`  Connect to an Array of `Nodes`.

Returns: `<Filter<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>>`

*public* **filter.disconnect(...nodes)**
- nodes `<Array<Node<LogContext<MessageT, SyslogLevelT>, unknown>>` Disconnect from an Array of `Nodes`.

Returns: `<Filter<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>>`

### The ConsoleHandler Class

**new streams-logger.ConsoleHandler\<MessageT\>(options, streamOptions)**
- `<MessageT>` The type of the logged message. **Default: `<string>`**
- options `<ConsoleHandlerTransformOtions>`
    - level `<SyslogLevel>` An optional log level.  **Default: `SyslogLevel.WARN`**
- streamOptions `<stream.TransformOptions>` Optional options to be passed to the stream.

Use a `ConsoleHandler` in order to stream your messages to the console.

*public* **consoleHandler.setLevel(level)**
- level `<SyslogLevel>` A log level.

Set the log level.  Must be one of `SyslogLevel`.

### The RotatingFileHandler Class

**new streams-logger.RotatingFileHandler\<MessageT\>(options, streamOptions)**
- `<MessageT>` The type of the logged message. **Default: `<string>`**
- options `<RotatingFileHandlerOptions>`
    - path `<string>` The path of the log file.
    - rotations `<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>` An optional number of log rotations. **Default: `0`**
    - maxBytes `<number>` The size of the log file in bytes that will initiate a rotation. **Default: `1e6`**
    - encoding `<BufferEncoding>` An optional encoding. **Default: `utf8`**
    - mode `<number>` An optional mode. **Deafult: `0o666`**
    - level `<SyslogLevel>` An optional log level.  **Default: `SyslogLevel.WARN`**
- streamOptions `<stream.TransformOptions>` Optional options to be passed to the stream.

Use a `RotatingFileHandler` in order to write your log messages to a file.  The `RotatingFileHandler` is thread safe.

*public* **rotatingFileHandler.setLevel(level)**
- level `<SyslogLevel>` A log level.

Set the log level.  Must be one of `SyslogLevel`.

### The SocketHandler Class

**new streams-logger.SocketHandler\<MessageT\>(options, streamOptions)**
- `<MessageT>` The type of the logged message. **Default: `<string>`**
- options `<SocketHandlerOptions>`
    - socket `<Socket>` A `net.Socket` that will serve as a communication channel between this `SocketHandler` and the remote `SocketHandler`.
    - reviver `<(this: unknown, key: string, value: unknown) => unknown>` An optional reviver for `JSON.parse`.
    - replacer `<(this: unknown, key: string, value: unknown) => unknown>` An optional replacer for `JSON.stringify`.
    - space `<string | number>` An optional space specification for `JSON.stringify`. 
- streamOptions `<stream.DuplexOptions>` Optional options to be passed to the stream.

Use a `SocketHandler` in order to connect *Stream* graphs over the network.  Please see the [*A Network Connected **Streams** Logging Graph*](#a-network-connected-streams-logging-graph-example) example for instructions on how to use a `SocketHandler` in order to connect *Streams* logging graphs over the network.

*public* **socketHandler.connect(...nodes)**
- nodes `<Array<Node<LogContext<MessageT, SyslogLevelT>, unknown>>`  Connect to an Array of `Nodes`.

Returns: `<SocketHandler<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>>`

*public* **socketHandler.disconnect(...nodes)**
- nodes `<Array<Node<LogContext<MessageT, SyslogLevelT>, unknown>>` Disconnect from an Array of `Nodes`.

Returns: `<SocketHandler<LogContext<MessageT, SyslogLevelT>, LogContext<MessageT, SyslogLevelT>>`

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

A `LogContext` is instantiated each time a message is logged at (or below) the level set on the `Logger`. It contains information about the process and environment at the time of the logging call.  All *Streams* Nodes take a `LogContext` as an input and emit a `LogContext` as an output.  

The `LogContext` is passed as the single argument to the [format function](#formatting) of the `Formatter`; information about the environment can be extracted from the `LogContext` in order to format the logged message.  The following properties will be available to the `format` function depending on the setting of `Config.captureStackTrace` and `Config.captureISOTime`.  Please see the [Log Context Data](#log-context-data) table for details.

*public* **LogContext.col**
- `<string>`
The column of the logging call.  Available if `Config.captureStackTrace` is set to `true`.

*public* **LogContext.env**
- `<NodeJS.ProcessEnv>`
The process environment.

*public* **LogContext.func**
- `<string>`
The name of the function where the logging call took place.  Available if `Config.captureStackTrace` is set to `true`.

*public* **LogContext.isotime**
- `<string>`
The date and time in ISO format at the time of the logging call. Available if `Config.captureISOTime` is set to `true`.

*public* **LogContext.level**
- `<DEBUG | INFO | NOTICE | WARN | ERROR | CRIT | ALERT | EMERG>`
An uppercase string representation of the level.

*public* **LogContext.line**
- `<string>`
The line number of the logging call.  Available if `Config.captureStackTrace` is set to `true`.

*public* **LogContext.message**
- `<string>`
The logged message.

*public* **LogContext.metadata**
- `<unknown>`
Optional user specified data.

*public* **LogContext.name**
- `<string>`
The name of the `Logger`.

*public* **LogContext.path**
- `<string>`
The complete path of the module.  Available if `Config.captureStackTrace` is set to `true`.

*public* **LogContext.pathbase**
- `<string>`
The module filename.  Available if `Config.captureStackTrace` is set to `true`.

*public* **LogContext.pathext**
- `<string>`
The extension of the module.  Available if `Config.captureStackTrace` is set to `true`.

*public* **LogContext.pathdir**
- `<string>`
The directory part of the module path.  Available if `Config.captureStackTrace` is set to `true`.

*public* **LogContext.pathname**
- `<string>`
The name of the module.  Available if `Config.captureStackTrace` is set to `true`.

*public* **LogContext.pathroot**
- `<string>`
The root of the path.  Available if `Config.captureStackTrace` is set to `true`.

*public* **LogContext.pid**
- `<string>`
The process identifier.

*public* **LogContext.threadid**
- `<string>`
The thread identifier.

### The Streams Config Settings Object

**Config.getDefaultHighWaterMark(objectMode)**
- objectMode `<boolean>` `true` if getting the ObjectMode `highWaterMark`; `false`, otherwise.

Returns: `<number>` The default `highWaterMark`.

**Config.getDuplexDefaults(writableObjectMode, readableObjectMode)**
- writableObjectMode `<boolean>` `true` for ObjectMode; `false` otherwise.
- readableObjectMode `<boolean>` `true` for ObjectMode; `false` otherwise.

Returns: `<stream.DuplexOptions>`

Use `Config.getDuplexDefaults` when implementing a [custom *Streams* data transformation Node](#how-to-implement-a-custom-streams-data-transformation-node).

**Config.getReadableDefaults(readableObjectMode)**
- readableObjectMode `<boolean>` `true` for ObjectMode; `false` otherwise.

Returns: `<stream.ReadableOptions>`

Use `Config.getReadableDefaults` when implementing a [custom *Streams* data transformation Node](#how-to-implement-a-custom-streams-data-transformation-node).

**Config.getWritableDefaults(writableObjectMode)**
- writableObjectMode `<boolean>` `true` for ObjectMode; `false` otherwise.

Returns: `<stream.WritableOptions>`

Use `Config.getWritableDefaults` when implementing a [custom *Streams* data transformation Node](#how-to-implement-a-custom-streams-data-transformation-node).

**Config.setCaptureISOTime(value)**
- value `<boolean>` Set this to `false` in order to disable capturing the ISO time on each logging call.  **Default: `true`**

Returns: `<void>`

**Config.setCaptureStackTrace(value)**
- value `<boolean>` Set this to `false` in order to disable stack trace capture on each logging call.  **Default: `true`**

Returns: `<void>`

**Config.setDefaultHighWaterMark(objectMode, value)**
- objectMode `<boolean>` `true` if setting the ObjectMode `highWaterMark`; `false`, otherwise.
- value `number` The `highWaterMark` value.

Returns: `<void>`

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

## Formatting

The `Logger` constructs and emits a `LogContext<MessageT, SyslogLevelT>` on each logged message.  The properties of a `LogContext` *may* undergo formatting and serialization using a `Formatter`.  This can be accomplished by passing a `FormatterOptions` object, to the constructor of a `Formatter`, with its `format` property set to a custom [serialization](#example-serializer) or transformation function that accepts a `LogContext` as its single argument.  The serialization function can construct a log message from the `LogContext` [properties](#the-LogContext-class).  In the concise example below this is accomplished by using a [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

### Example Serializer

In the following code excerpt, a serializer is implemented that logs:

1. The time of the logging call in ISO format
2. The log level
3. The name of the function where the log event originated
4. The line number of the log event
5. The column number of the log event
6. The log message
7. A newline

The `format` function is passed in a `FormatterOptions` object to the constructor of a `Formatter`.  The `Logger` is connected to the `Formatter`.  The `Formatter` is connected to the `ConsoleHandler`.

```ts
import { Logger, Formatter, ConsoleHandler, SyslogLevel } from 'streams-logger';

const logger = new Logger({ name: 'main', level: SyslogLevel.DEBUG });
const formatter = new Formatter({
    format: async ({ isotime, message, name, level, func, url, line, col }) => (
        `${isotime}:${level}:${func}:${line}:${col}:${message}\n`
    )
});
const consoleHandler = new ConsoleHandler();

const log = logger.connect(
    formatter.connect(
        consoleHandler
    )
);

log.info('Hello, World!');
```

This is an example of what a logged message will look like using the serializer defined above.

```bash
# ⮶date-time    function name⮷   column⮷ ⮶message
2024-06-12T00:10:15.894Z:INFO:sayHello:7:9:Hello, World!
#                        ⮴level       ⮴line number
```
## Object (JSON) Logging
*Streams* logging facilities (e.g., Logger, Formatter, etc.) default to `string` messages; however, you can log any type of message you want.  In the following example, a permissive interface is created named `Message` and messages are serialized using `JSON.stringify`.

```ts
import { Logger, Formatter, ConsoleHandler, SyslogLevel } from 'streams-logger';

interface Message {
    [key: string]: string | number;
}

const logger = new Logger<Message>({ level: SyslogLevel.DEBUG });
const formatter = new Formatter<Message, string>({
    format: async ({ isotime, message, level, func, line, col }) => (
        `${isotime}:${level}:${func}:${line}:${col}:${JSON.stringify(message)}\n`
    )
});
const consoleHandler = new ConsoleHandler<string>({ level: SyslogLevel.DEBUG });

const log = logger.connect(
    formatter.connect(
        consoleHandler
    )
);

(function sayHello() {
    log.warn({ greeting: 'Hello, World!', prime: 57 });
})();
```
### Output
```bash
2024-07-06T03:19:28.767Z:WARN:sayHello:9:9:{"greeting":"Hello, World!","prime":57}
```

## Using a Socket Handler

*Streams* uses Node.js streams for message propagation.  Node.js represents sockets as streams; hence, sockets are a natural extension of a *Streams* logging graph.  For example, you may choose to use a `ConsoleHandler` locally and log to a `RotatingFileHandler` on a remote server.  Please see the [*A Network Connected **Streams** Logging Graph*](#a-network-connected-streams-logging-graph-example) example for a working implementation.

### Security

The `SocketHandler` options take a socket instance as an argument.  The `net.Server` that produces this socket may be configured however you choose.  You can encrypt the data sent over TCP connections and authenticate clients by configuring your `net.Server` accordingly.

#### Configure your server to use TLS encryption.
TLS Encryption may be implemented using native Node.js [TLS Encryption](https://nodejs.org/docs/latest-v20.x/api/tls.html).

#### Configure your client to use TLS client certificate authentication.
TLS Client Certificate Authentication may be implemented using native Node.js [TLS Client Authentication](https://nodejs.org/docs/latest-v20.x/api/tls.html).

## Hierarchical Logging

*Streams* supports hierarchical logging.  By default every `Logger` instance is connected to the root `Logger` (`streams-logger.root`).  However, you may optionally specify an antecedent other than `root` by assigning an instance of `Logger` to the `parent` property in the `LoggerOptions`.  The antecedent of the root `Logger` is `null`.

You may capture logging events from other modules (*and your own*) by connecting a data handler `Node` (e.g., a `ConsoleHandler`) to the `streams-logger.root` `Logger`. E.g.,

```ts
import { Formatter, ConsoleHandler, SyslogLevel, root } from 'streams-logger';

const formatter = new Formatter({
    format: async ({ isotime, message, name, level, func, url, line, col }) => (
        `${isotime}:${level}:${func}:${line}:${col}:${message}\n`
    )
});
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

root.connect(
    formatter.connect(
        consoleHandler
    )
);
```

## How-Tos

### How to implement a custom *Streams* data transformation Node.

*Streams* is built on the type-safe Nodes graph API framework.  This means that any Nodes `Node` may be incorporated into your logging graph given that it meets the contextual type requirements.  In order to implement a *Streams* data transformation `Node`, subclass the `Node` class, and provide the appropriate *Streams* defaults to the stream constructor.

For example, the somewhat contrived `LogContextToBuffer` implementation transforms the `message` contained in a `LogContext` to a `Buffer`; the graph pipeline streams the message to `process.stdout`.

> NB: `writableObjectMode` is set to `true` and `readableObjectMode` is set to `false`; hence, the Node.js stream implementation will handle the input as a `object` and the output as an `Buffer`. It's important that `writableObjectMode` and `readableObjectMode` accurately reflect the input and output types of your Node.

```ts
import * as stream from 'node:stream';
import { Logger, Node, Config, LogContext, SyslogLevelT } from 'streams-logger';

export class LogContextToBuffer extends Node<LogContext<string, SyslogLevelT>, Buffer> {

    public encoding: NodeJS.BufferEncoding = 'utf-8';

    constructor(streamOptions?: stream.TransformOptions) {
        super(new stream.Transform({
            ...Config.getDuplexDefaults(true, false),
            ...streamOptions,
            ...{
                writableObjectMode: true,
                readableObjectMode: false,
                transform: (chunk: LogContext<string, SyslogLevelT>, encoding: BufferEncoding, callback: stream.TransformCallback) => {
                    callback(null, Buffer.from(chunk.message, this.encoding));
                }
            }
        })
        );
    }
}

const log = new Logger({ name: 'main' });
const logContextToBuffer = new LogContextToBuffer();
const console = new Node<Buffer, never>(process.stdout)

log.connect(
    logContextToBuffer.connect(
        console
    )
);

log.warn('Hello, World!');
```
#### Output
```bash
Hello, World!
```

### How to consume a Readable, Writable, Duplex, or Transform Node.js stream.

You can incorporate any Readable, Writable, Duplex, or Transform stream into your logging graph, given that it meets the contextual type requirements, by passing the stream to the `Node` constructor.  In this hypothetical example a type-safe `Node` is constructed from a `net.Socket`.  The type variables are specified as `<Buffer, Buffer>`; the writable side of the stream consumes a `Buffer` and the readable side of the stream produces a `Buffer`. 

```ts
import * as net from 'node:net';
import { once } from 'node:events';
import { Node } from 'streams-logger';

net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000);
const socket = net.createConnection({ port: 3000 });
await once(socket, 'connect');
const socketHandler = new Node<Buffer, Buffer>(socket);
```

## Tuning

**Depending on your requirements the defaults may be fine.**  However, for high throughput applications you may choose to adjust the `highWaterMark`, disconnect your `Logger` from the root `Logger`, and/or disable stack trace capturing.

### Tune the `highWaterMark`.

*Streams* `Node` implementations use the native Node.js stream API for message propagation.  You have the option of tuning the Node.js stream `highWaterMark` to your specific needs - keeping in mind memory constraints.  You can set a default `highWaterMark` using `Config.setDefaultHighWaterMark(objectMode, value)` that will apply to Nodes in the *Streams* library.  Alternatively, you can pass an optional stream configuration argument to each `Node` individually.

In this example, the `highWaterMark` of ObjectMode streams and Buffer streams is artificially set to `1e6` objects and `1e6` bytes.

```ts
import * as streams from 'streams-logger';

streams.Config.setDefaultHighWaterMark(true, 1e6);
streams.Config.setDefaultHighWaterMark(false, 1e6);
```

### Disable stack trace capture.

Another optional setting that you can take advantage of is to turn off stack trace capture.  Stack trace capture can be disabled globally using the *Streams* configuration settings object i.e., `Config.setCaptureStackTrace`.  Alternatively, you may disable stack trace capturing in a specific `Logger` by setting the `stackTraceCapture` property of the `LoggerOptions` to `false`. 

Turning off stack trace capture will disable some of the information (e.g., function name and line number) that is normally contained in the `LogContext` object that is passed to the `format` function of a `Formatter`.

```ts
import * as streams from 'streams-logger';

streams.Config.setCaptureStackTrace(false);
```

### Disconnect from root.

You can optionally disconnect your `Logger` from the root `Logger` or a specified antecedent.  This will prevent message propagation to the root logger, which will provide cost savings and isolation.  E.g.,

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
*Streams* respects backpressure by queueing messages while the stream is draining.  You can set a limit on how large the message queue may grow by specifying a `queueSizeLimit` in the Logger constructor options.  If a `queueSizeLimit` is specified and if it is exceeded, the `Logger` will throw a `QueueSizeLimitExceededError`.  

**For typical logging applications setting a `queueSizeLimit` isn't necessary.**  However, if a stream peer reads data at a rate that is slower than the rate that data is written to the stream, data may buffer until memory is exhausted.  By setting a `queueSizeLimit` you can effectively respond to subversive stream peers and disconnect offending Nodes in your graph.

If you have a *cooperating* stream that is backpressuring, you can either set a default `highWaterMark` appropriate to your application or increase the `highWaterMark` on the specific stream in order to mitigate drain events.