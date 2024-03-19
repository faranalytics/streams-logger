import * as net from 'node:net';

const server = net.createServer((c) => {
    // 'connection' listener.
    console.log('client connected');
    c.on('end', () => {
        console.log('client disconnected');
    });
    c.on('data', (data) => { console.log(data.toString()); });
    c.write('hello\r\n');
    c.pipe(c);
});
server.on('error', (err) => {
    throw err;
});
server.listen(3000, () => {
    console.log('server bound');
}); 