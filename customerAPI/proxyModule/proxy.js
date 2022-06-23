/* eslint-disable no-console */
const net = require('net');

const proxyPort = 8080; // OS will assign random unused port if value === 0
const proxyHost = /* 'localhost' || */ '0.0.0.0';
const server = net.createServer();

server.on('connection', (clientToProxySocket) => {
  console.log('Client is connected to proxy');

  clientToProxySocket.once('data', (data) => {
    // Route request to API server for validation
    const proxytoApiSocket = net.createConnection({
      host: 'localhost',
      port: 9000,
    }, () => {
      console.log('Proxy to API server set up');
    });
    console.log(data.toString());

    proxytoApiSocket.write(data);
    clientToProxySocket.pipe(proxytoApiSocket);
    proxytoApiSocket.pipe(clientToProxySocket);

    // Filter address info from request
    const serverAddress = data.toString().split('Host: ')[1].split(':')[0];
    const serverPort = data.toString().split(':')[2].split('\n')[0];

    console.log('Server address is:', serverAddress);
    console.log('Server port is:', serverPort);

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
  console.log(`Proxy server listening at http://${proxyHost}:${proxyPort}`);
});
