const net = require('net');

const port = 0; // OS will assign random unused port
const host = 'localhost' || '0.0.0.0';
const server = net.createServer();

server.on('connection', (socket) => {
  console.log('Connected to proxy');
  socket.once("data", (data) => {
    console.log(data.toString());
});

server.on('error', (err) => {
  console.log('Server error');
  console.error(err);
});

server.on('close', () => {
  console.log('Client disconnected');
});

server.listen(port, host, () => {
  console.log(`Proxy server listening at http://${host}:${server.address().port}`);
});
