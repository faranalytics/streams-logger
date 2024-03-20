# Streams Logger

Streams is a type-safe logger for TypeScript *and* Node projects.

## Introduction

Streams offers a type-safe logging facility built on native Node streams that can be used in both TypeScript and Node projects. 

### Features
- Type-safe pipelines.
- Consume native Node Writable streams.
- Error propagation.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)

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

### Create the stream components.
```ts
const log = new LevelLogger({name: 'Greetings', level: Levels.DEBUG});
const messageFormatter = new MessageFormatter(formatter);
const stringToBuffer = new StringToBuffer();
const echoServer = new Connector<Buffer, Buffer>(net.createConnection(3000, '127.0.0.1'));
const bufferToString = new BufferToString();
const stringToConsole = new StringToConsole();
```

### Connect them into a stream.
```ts
log.connect(messageFormatter).connect(stringToBuffer).connect(echoServer).connect(bufferToString).connect(stringToConsole);
```

### Say "Hello, World!".
```ts
(function sayHello() {
    log.debug('Hello, World!');
})();
```
