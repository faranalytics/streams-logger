# _Log to a File and the Console_

## Introduction

In this example you will use _Streams_ in order to log "Hello, World!" to a file and the console using different instances of a `Formatter`. Streams provides a rich selection of [contextual information](https://github.com/faranalytics/streams-logger/tree/main?tab=readme-ov-file#log-context-properties) to choose from. For this example you will log:

- The name of the logger
- The ISO time
- The log level
- The name of the function where the logging call took place
- The line number
- The column number
- The log message
- A newline

## Implement the example

### Implement the `index.ts` module

```ts
import {
  Logger,
  Formatter,
  ConsoleHandler,
  SyslogLevel,
  RotatingFileHandler,
} from "streams-logger";

const logger = new Logger({ name: "hello-logger", level: SyslogLevel.DEBUG });
const consoleFormatter = new Formatter({
  format: ({ isotime, message, name, level }) =>
    `${name}:${isotime}:${level}:${message}\n`,
});
const fileFortmatter = new Formatter({
  format: ({ isotime, message, name, level, func, url, line, col }) =>
    `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`,
});
const rotatingFileHandler = new RotatingFileHandler({
  path: "./message.log",
  rotationLimit: 0,
  level: SyslogLevel.DEBUG,
});
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

const log = logger.connect(
  consoleFormatter.connect(consoleHandler),
  fileFortmatter.connect(rotatingFileHandler)
);

function sayHello() {
  log.info("Hello, World!");
}

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
cd streams-logger/examples/log_to_a_file_and_the_console
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

`message.log`

```bash
hello-logger:2024-07-07T14:22:13.683Z:INFO:sayHello:14:9:Hello, World!
```

`console`

```bash
hello-logger:2024-07-07T14:22:13.683Z:INFO:Hello, World!
```
