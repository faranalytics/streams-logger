# *An instance of "Hello, World!"*

In this example you will use Streams in order to log "Hello, World!" to the console.

## Implementation

### Import the Logger, Formatter, ConsoleHandler, and SyslogLevel enum.

```ts
import { Logger, Formatter, ConsoleHandler, SyslogLevel } from 'streams-logger';
```

### Create an instance of a Logger, Formatter, and ConsoleHandler.
```ts
const logger = new Logger({ level: SyslogLevel.INFO });
const formatter = new Formatter(async ($) => `${new Date().toISOString()}:${$.level}:${$.func}:${$.line}:${$.col}:${$.message}\n`);
const consoleHandler = new ConsoleHandler();
```

### Connect the Logger to the Formatter and connect the Formatter to the ConsoleHandler.
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

## Instructions

Follow the instructions to run the example.

### Clone the Network-Services repo.
```bash
git clone https://github.com/faranalytics/streams-logger.git
```
### Change directory into the relevant example directory.
```bash
cd streams-logger/examples/hello_world
```
### Install the example dependencies.
```bash
npm install && npm update
```
### Build the application.
```bash
npm run clean:build
```
### Run the application.
```bash
npm start
```
#### Output
```bash
2024-06-12T00:10:15.894Z:INFO:sayHello:7:9:Hello, World!
```