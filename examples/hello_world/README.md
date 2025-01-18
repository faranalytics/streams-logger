# _An Instance of "Hello, World!"_

## Introduction

In this example you will use Streams in order to log "Hello, World!" to the console.

## Implement the example

### Implement the `index.ts` module

#### Import the Logger, Formatter, ConsoleHandler, and SyslogLevel enum.

```ts
import { Logger, Formatter, ConsoleHandler, SyslogLevel } from "streams-logger";
```

#### Create an instance of a Logger, Formatter, and ConsoleHandler.

```ts
const logger = new Logger({ name: "hello-logger", level: SyslogLevel.DEBUG });
const formatter = new Formatter({
  format: ({ isotime, message, name, level, func, url, line, col }) =>
    `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`,
});
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });
```

#### Connect the Logger to the Formatter and connect the Formatter to the ConsoleHandler.

```ts
const log = logger.connect(formatter.connect(consoleHandler));
```

#### Log "Hello, World!" to the console.

```ts
function sayHello() {
  log.info("Hello, World!");
}

setInterval(sayHello, 1e3);

sayHello();
```

## Run the example

### How to run the example

#### Clone the _Streams_ repository.

```bash
git clone https://github.com/faranalytics/streams-logger.git
```

#### Change directory into the relevant example directory.

```bash
cd streams-logger/examples/hello_world
```

#### Install the example dependencies.

```bash
npm install && npm update
```

#### Build the application.

```bash
npm run clean:build
```

#### Run the application.

```bash
npm start
```

##### Output

```bash
hello-logger:2024-07-06T00:44:46.045Z:INFO:sayHello:10:9:Hello, World!
hello-logger:2024-07-06T00:44:47.047Z:INFO:Timeout.sayHello:10:9:Hello, World!
...
```
