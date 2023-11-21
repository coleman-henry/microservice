const zmq = require('zeromq');
const sock = zmq.socket('push');

const host = '127.0.0.1';
const port = '5000';

sock.bindSync(`tcp://${host}:${port}`);

setInterval(() =>{
    sock.send('ready');
});