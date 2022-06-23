/* eslint-disable no-console */
const net = require('net');

const proxyPort = 8080; // OS will assign random unused port if value === 0
const proxyHost = /* 'localhost' || */ '0.0.0.0';
const apiServerPort = 9000;
const server = net.createServer();

server.on('connection', (clientToProxySocket) => {
  console.log('Client is connected to proxy');

  clientToProxySocket.once('data', (data) => {
    console.log('---Original request from client---\n', data.toString(), '---End of original request---\n');

    // Filter address info from request
    const destServerAddress = data.toString().split('Host: ')[1].split(':')[0];
    const destServerPort = data.toString().split(':')[2].split('\n')[0];

    // Create API Server socket
    const proxyToApiSocket = net.createConnection({
      port: apiServerPort,
    }, () => {
      console.log('Proxy to API server set up');
    });

    // Create Destination server socket
    const proxyToServerSocket = net.createConnection({
      host: destServerAddress,
      port: destServerPort,
    }, () => {
      console.log('Proxy to Destination server set up');
    });

    // Write orig req data to socket
    proxyToApiSocket.write(data);
    clientToProxySocket.pipe(proxyToApiSocket);

    // Send final response to client
    proxyToApiSocket.on('data', (responseData) => {
      const validityStatus = responseData.toString().split('req-validation-status: ')[1].split('\r\n')[0];

      // Check if request was validated
      if (validityStatus === 'valid') {
        console.log(data.toString());

        proxyToServerSocket.write(data);
        proxyToServerSocket.pipe(clientToProxySocket);
        clientToProxySocket.pipe(proxyToServerSocket);
      } else {
        clientToProxySocket.write('HTTP/1.1 400 Bad Request\r\n' + '\r\n');
        clientToProxySocket.write('Blocked request\r\n');
        clientToProxySocket.write(data);
        clientToProxySocket.end();
      }
      console.log(responseData.toString(), '\n');
    });

    // Error handling for sockets
    proxyToApiSocket.on('error', (err) => {
      console.log('Proxy to API Server error');
      console.log(err);
    });
    proxyToServerSocket.on('error', (err) => {
      console.log('Proxy to Destination server error');
      console.log(err);
    });
    clientToProxySocket.on('error', (err) => {
      console.log('Client to Proxy error');
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
