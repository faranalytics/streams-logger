# Streams Logger

Streams is a type-safe logger for TypeScript and Node.

## Introduction

Streams offers a type-safe logging facility built on native Node streams that can be used in both TypeScript and Node projects.

### Features

- Type-safe logging pipelines.
- Consume any native Node Writable stream.
- A graph API pattern for constucting sophisticated logging pipelines.
- Error propagation and selective termination of inoperable graph components.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [How to Implement a Transform](#how-to-implement-a-transform)

## Installation

```bash
npm install streams-logger
```

## Usage

In this hypothetical example you will log "Hello, World!" to the console and to a remote TCP server.

### Import the dependencies.

```ts
import * as net from 'node:net';
import { Logger } from "streams-logger";
```

### Create the echo server.

```ts
net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000, '127.0.0.1');
```

### Create a formatter function for handling the `Message<Levels>` message.

```ts
const formatter = ({ message, name, level, error, func, url, line, col }: Message<Levels>) => `${name}:${Levels[level]}:${func}:${line}:${col}:${message}`;
```

### Create the stream Transforms and Connectors.

```ts
const log = new LevelLogger({name: 'Greetings', level: Levels.DEBUG});
const messageFormatter = new MessageFormatter(formatter);
const stringToBuffer = new StringToBuffer();
const echoServer = new Connector<Buffer, Buffer>(net.createConnector(3000, '127.0.0.1'));
const bufferToString = new BufferToString();
const stringToConsole = new StringToConsole();
```

### Connect the Transforms and Connectors that comprise the Logger into a pipeline.

```ts
log.connect(
    messageFormatter
).connect(
    stringToBuffer
).connect(
    echoServer
).connect(
    bufferToString
).connect(
    stringToConsole
);
```

### Log "Hello, World!" to the console.

```ts
(function sayHello() {
    log.debug('Hello, World!');
})();
```

#### Output:
```bash
Greetings:DEBUG:sayHello:13:9:Hello, World!
```

## How to Implement a Transform

A `Transform` is a `Connector` that transforms a value from one data model or type to another.  You can see examples of simple helper transformations in `./src/transforms.ts`.

In this example the `StringToBuffer` `Transform` tranforms a `string` into a `Buffer` using the given encoding. 

```ts
export class StringToBuffer extends Transform<string, Buffer> {
    constructor() {
        super(
            (chunk: string, encoding?: BufferEncoding) => Buffer.from(chunk, encoding), 
            { writableObjectMode: false, readableObjectMode: false }
        );
    }
}

```

## How to Implement a Connector

A `Connector` wraps a native `stream.Writable` stream.

In this simple example a `Connector` is implemented using the `stream.Writable` stream `process.stdout`.

```ts
export class StringToConsole extends Connector<string, never> {
    constructor() {
        super(process.stdout);
    }
}
```

Similarly a `Connector` can be constructed using the `Connector` constructor.  In this example a `Connector` is made from a `net.Socket`, which is a `stream.Duplex` stream.

```ts
const echoServer = new Connector<Buffer, Buffer>(net.createConnector(3000, '127.0.0.1'));
```