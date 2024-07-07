# *Log to a File and the Console*

In this example you will use Streams in order to log "Hello, World!" to a file and the console using different `Formatters`.

## Implementation

```ts
import { Logger, Formatter, ConsoleHandler, SyslogLevel, RotatingFileHandler } from 'streams-logger';

const logger = new Logger({ name: 'hello-logger', level: SyslogLevel.DEBUG });
const consoleFormatter = new Formatter({
    format: async ({ isotime, message, name, level, func, url, line, col }) => (
        `${name}:${isotime}:${level}:${message}\n`
    )
});
const fileFortmatter = new Formatter({
    format: async ({ isotime, message, name, level, func, url, line, col }) => (
        `${name}:${isotime}:${level}:${func}:${line}:${col}:${message}\n`
    )
});
const rotatingFileHandler = new RotatingFileHandler({ path: './message.log', rotations: 0, level: SyslogLevel.DEBUG });
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

const log = logger.connect(
    consoleFormatter.connect(
        consoleHandler
    ),
    fileFortmatter.connect(
        rotatingFileHandler
    )
);

function sayHello() {
    log.info('Hello, World!');
}

sayHello();
```

## Instructions

Follow the instructions to run the example.

### Clone the Streams repo.
```bash
git clone https://github.com/faranalytics/streams-logger.git
```
### Change directory into the relevant example directory.
```bash
cd streams-logger/examples/log_to_a_file_and_the_console
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
`message.log`
```bash
hello-logger:2024-07-07T14:22:13.683Z:INFO:sayHello:14:9:Hello, World!
```
`console`
```bash
hello-logger:2024-07-07T14:22:13.683Z:INFO:Hello, World!
```