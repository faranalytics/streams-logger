# Streams Logger

Streams is a type-safe logger for TypeScript *and* Node projects.

## Introduction

Streams offers a type-safe logging facility built on native Node streams that can be used in both TypeScript and Node projects. 

### Features

- Type-safe pipelines.
- Consume any native Node Writable stream as a component of your logger.
- Error propagation.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [How to Implement a Transform](#how-to-implement-a-transform)
- [How to Implement a Connector](#how-to-implement-a-connection)

## Installation

```bash
npm install streams-logger
```

## Usage

In this hypothetical example we will log "Hello, World!" to the console the hard way!  The "Hello, World!" message will undergo the following transformations:
- Start with the `string` "Hello, World!". 
- Transform it into a `Message<Levels>` and capture its containing function, line number, and column number.
- Transform the `Message<Levels>` into a `string`.
- Transform the `string` into a `Buffer`.
- Send the `Buffer` over a TCP connection to an echo `net.Server`.
- Receive the `Buffer` returned from the `net.Server`.
- Transform the `Buffer` into a `string`.
- Log the `string` to the console.

### Import the required dependencies.

```ts
import * as net from 'node:net';
import { BufferToString, Connector, MessageFormatter, Levels, LevelLogger, Message, StringToBuffer, StringToConsole } from "pipes-logger";
```

### Create the Echo Server.

```ts
net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000, '127.0.0.1');
```

### Create a formatter function for handling the `Message<Levels>` message.

```ts
const formatter = ({ message, name, level, error, func, url, line, col }: Message<Levels>) => `${name}:${Levels[level]}:${func}:${line}:${col}:${message}`;
```

### Create the stream Connectors.

```ts
const log = new LevelLogger({name: 'Greetings', level: Levels.DEBUG});
const messageFormatter = new MessageFormatter(formatter);
const stringToBuffer = new StringToBuffer();
const echoServer = new Connector<Buffer, Buffer>(net.createConnector(3000, '127.0.0.1'));
const bufferToString = new BufferToString();
const stringToConsole = new StringToConsole();
```

### Connect the Transforms and Connectors that comprise the Logger into a stream.

```ts
log.connect(messageFormatter).connect(stringToBuffer).connect(echoServer).connect(bufferToString).connect(stringToConsole);
```

### Say "Hello, World!".

```ts
(function sayHello() {
    log.debug('Hello, World!');
})();
```

### Output
```bash
Greetings:DEBUG:sayHello:13:9:Hello, World!
```

## How to Implement a Transform

A `Transform` is a `Connector` that transforms a message from one form or type to another.  You can see examples of simple transformations in `./src/connections.ts`.

In this example the `StringToBuffer` `Transform` tranforms a string into a `Buffer` using the given encoding. 

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

Similarly a `Connector` can be constructed in-place using the `Connector` constructor.  In this example a `Connector` is made from a `stream.Duplex` `net.Socket`.

```ts
const echoServer = new Connector<Buffer, Buffer>(net.createConnector(3000, '127.0.0.1'));
```