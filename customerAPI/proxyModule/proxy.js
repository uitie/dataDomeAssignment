/* eslint-disable no-console */
const net = require('net');

const proxyPort = 8080; // OS will assign random unused port
const proxyHost =/*  'localhost' || */ '0.0.0.0';
const server = net.createServer();

server.on('connection', (clientToProxySocket) => {
  console.log('Connected to proxy');

  clientToProxySocket.once('data', (data) => {
    const serverPort = 80;
    // Filter address info from request
    const serverAddress = data
      .toString()
      .split('Host: ')[1]
      .split('\r\n')[0];

    console.log(serverAddress);

    // Create connection to destination server
    const proxyToServerSocket = net.createConnection({
      host: serverAddress,
      port: serverPort,
    }, () => {
      console.log('Proxy to server set up');
    });

    proxyToServerSocket.write(data);

    clientToProxySocket.pipe(proxyToServerSocket);
    proxyToServerSocket.pipe(clientToProxySocket);

    proxyToServerSocket.on('error', (err) => {
      console.log('Proxy to server error');
      console.log(err);
    });

    clientToProxySocket.on('error', (err) => {
      console.log('Client to proxy error');
      console.log(err);
    });
  });
});

server.on('error', (err) => {
  console.log('Server error');
  console.error(err);
});

server.on('close', () => {
  console.log('Client disconnected');
});

server.listen(proxyPort, proxyHost, () => {
  console.log(`Proxy server listening at http://${proxyHost}:${/* server.address(). */proxyPort}`);
});
