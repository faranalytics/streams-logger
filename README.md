# Streams Logger

Streams is a type-safe logger for TypeScript and Node.

## Introduction

Streams offers an intuitive type-safe logging facility built on native Node streams.  You can use the built-in logging components for common logging tasks or implement your own [transformation](#how-to-implement-a-transform).

### Features

- Type-safe logging pipelines.
- Consume any native Node Writable stream and add it to your pipeline.
- A graph API pattern for constucting sophisticated logging pipelines.
- Error propagation and selective termination of inoperable graph components.

## Table of Contents

- [Installation](#installation)
- [Concepts](#concepts)
- [Usage](#usage)
- [How to Implement a Transform](#how-to-implement-a-transform)

## Installation

```bash
npm install streams-logger
```

## Concepts

### Transform

The Streams framework is based on the idea that logging is essentially a data transformation task.  When a string is logged to the console, for example, it typically undergoes a transformation step where relevant information (e.g., the timestamp, log level, etc.) is added to the log message prior to being printed to the console.  A Streams logging task involves data flowing through a network of Transforms.  You can use the built-in Transforms supplied with the package for common logging tasks or [build you own type-safe Transforms](#how-to-implement-a-transform) for logging anything that can move through a Buffer or Object stream; that's just about anything.

## Usage

In this hypothetical example you will log "Hello, World!" to the console.

### Import the Logger, Formatter, ConsoleHandler, and SyslogLevel enum.

```ts
import { Logger, Formatter, ConsoleHandler, SyslogLevel } from 'streams-logger';
```

### Create an instance of a Logger, Formatter, and ConsoleHandler.
- The Logger will be set to log at level `SyslogLevel.INFO`.  
- The Formatter will be passed a serialization function that will output a string containing the ISO time, the log level, the function name, the line number, the column number, and the log message.
- The ConsoleHandler will log the message to `process.stdout`.

```ts
const logger = new Logger({ level: SyslogLevel.INFO });
const formatter = new Formatter(async ($) => `${new Date().toISOString()}:${$.level}:${$.func}:${$.line}:${$.col}:${$.message}\n`);
const consoleHandler = new ConsoleHandler();
```

### Connect the Logger to the Formatter and connect the Formatter to the ConsoleHandler.
Streams uses a graph-style API in order to construct a network of log Transforms.  Each component in the network, the Logger, the Formatter, and the ConsoleHandler, is a [Transform](#transform).
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

## How to Implement a Transform

