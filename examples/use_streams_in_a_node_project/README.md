# *Use Streams in a Node.js Project*

In the other examples, *Streams* is demonstrated in TypeScript projects.  However, you can use *Streams* in your Node.js project too. In this example, you will use `require` in order to import *Streams* logging Nodes.  You will assemble the Nodes into a logging graph and log a Greeting object and a string to the console and a file.

## Implementation

```ts
const { Logger, Formatter, ConsoleHandler, SyslogLevel, RotatingFileHandler } = require('streams-logger');

const logger = new Logger({ name: 'hello-logger', level: SyslogLevel.DEBUG });
const formatter = new Formatter({
    format: async ({ isotime, message, name, level, func, line, col }) => (
        `${name}:${isotime}:${level}:${func}:${line}:${col}:${JSON.stringify(message)}\n`
    )
});

const rotatingFileHandler = new RotatingFileHandler({ path: './message.log', rotationLimit: 0, level: SyslogLevel.DEBUG });
const consoleHandler = new ConsoleHandler({ level: SyslogLevel.DEBUG });

const log = logger.connect(
    formatter.connect(
        consoleHandler,
        rotatingFileHandler
    )
);

function sayHello() {
    log.warn("Hello, World!");
    log.debug({ 'Greeting': 'Hello, World!' });
}

setInterval(sayHello, 1000);
```

## Instructions

Follow the instructions to run the example.

### Clone the Streams repo.
```bash
git clone https://github.com/faranalytics/streams-logger.git
```
### Change directory into the relevant example directory.
```bash
cd streams-logger/examples/use_streams_in_a_node_project
```
### Install the example dependencies.
```bash
npm install && npm update
```
### Run the application.
```bash
npm start
```
#### Output
`message.log`
```bash
hello-logger:2024-07-20T15:21:55.396Z:WARN:Timeout.sayHello:21:9:"Hello, World!"
hello-logger:2024-07-20T15:21:55.397Z:DEBUG:Timeout.sayHello:22:9:{"Greeting":"Hello, World!"}
...
```
`console`
```bash
hello-logger:2024-07-20T15:21:55.396Z:WARN:Timeout.sayHello:21:9:"Hello, World!"
hello-logger:2024-07-20T15:21:55.397Z:DEBUG:Timeout.sayHello:22:9:{"Greeting":"Hello, World!"}
...
```