# Streams Logger

Streams is a type-safe logger for TypeScript and Node.

## Introduction

Streams offers an intuitive type-safe logging facility built on native Node streams.  You can use the built-in logging components (e.g., Logger, Formatter, ConsoleHandler) for [common logging tasks](#usage) or implement your own [Transforms](#how-to-implement-a-transform) in order to handle a wide range of logging scenarios.

### Features

- Type-safe logging pipelines.
- Consume any native Node Writable stream and add it to your pipeline.
- A graph API pattern for constucting sophisticated logging pipelines.
- Error propagation and selective termination of inoperable graph components.

## Table of Contents

- [Installation](#installation)
- [Concepts](#concepts)
- [Usage](#usage)
- [Examples](#examples)
- [API](#api)
- [How to Implement a Transform](#how-to-implement-a-transform)

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

### The `Transform` class.

**new streams-logger.Transform\<InT, OutT\>(options)**
- options
    - `stream` `<stream.Writable>` An instance of a `stream.Writable`.
    - `transform` `<(data: InT) => Promise<OutT>>` A function that will transform data of type `InT` to `outT`.

**transform.connect\<T extends Transform\<OutT, unknown\>\>(...transforms: Array\<T\>)**
- transforms `<Array<T>>` An array of `Transforms<OutT, unknown>`.

Returns: `<Transform<InT, OutT>>`

**transform.write(data: InT)**
- data `<InT>` Data to write to the `stream.Writable`.

Returns: `<Promise<void>>`

## How to Implement a streams-logger.Transform

In order to implement a `Transform`, extend the `streams-logger.Transform` class and pass a `stream.Transform` implementation to the super's constructor.  

For example, the following `StringToNumber` implementation will convert a numeric string to a number.  

> NB: `writableObjectMode` and `readableObjectMode` are both set to true; hence, the object modes should reflect the inputs and outputs of your `Transform`.

```ts
class StringToNumber extends Transform<Buffer, number> {

    constructor() {
        super(new stream.Transform({
            writableObjectMode: true,
            readableObjectMode: true,
            transform: (chunk: Buffer, encoding: BufferEncoding, callback: stream.TransformCallback) => {
                const result = parseFloat(chunk.toString());
                callback(null, result);
            }
        }));
    }
}
```

## How to Consume a stream.Duplex

In this hypothetical example a type-safe `Transform` is constructed from a `net.Socket`.

```ts
net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000);
const socket = net.createConnection({ port: 3000 });
await new Promise((r, e) => socket.once('connect', r).once('error', e));
const socketHandler = new Transform<Buffer, Buffer>(socket);
```