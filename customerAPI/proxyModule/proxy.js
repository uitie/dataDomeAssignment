/* eslint-disable no-console */
require('dotenv').config();
const net = require('net');
const http = require('http');
const fs = require('fs').promises;
const crypto = require('crypto');

const proxyPort = process.env.PROXYPORT || 8080; // OS will assign random unused port if value === 0
const proxyHost = process.env.PROXYHOST || '0.0.0.0';
const apiServerPort = process.env.APISERVERPORT || 9000;

const server = net.createServer();

// Modify original request before validation
/* const editClientRequest = async (clientReq, destServerAddress, destServerPort) => {
  console.log('@@@@@@@@\n', JSON.stringify(String.fromCharCode(...clientReq.toJSON().data)), '\n');
  let modifiedReq = {};
  const regex = /\r\n|\s/g;
  let clientReqBuf = clientReq.toJSON().data;
  clientReqBuf = String.fromCharCode(...clientReqBuf);
  clientReqBuf = clientReqBuf.toString().slice(clientReq.indexOf('Host: '), clientReq.lastIndexOf('\r\n') - 2);
  clientReqBuf = clientReqBuf.replaceAll(regex, '"'); 
  clientReqBuf = clientReqBuf.split(/\r\n|:\s/);

  let reqHeaderObj = {};
  for (let i = 0; i < clientReqBuf.length; i += 2) {
    const tempStr = clientReqBuf[i + 1];
    reqHeaderObj[clientReqBuf[i]] = tempStr;
  }
  reqHeaderObj = (JSON.stringify(reqHeaderObj));

  const clientReqHeaders = clientReq.toString().slice(clientReq.indexOf('Host: '), clientReq.lastIndexOf('\r\n') - 1);
  const crequest = http.request('http://localhost', JSON.stringify(clientReq));

  crequest.setHeader('port', parseInt(destServerPort, 10));
  for (let i = 2; i < clientReqBuf.length; i += 2) {
    crequest.setHeader(clientReqBuf[i], clientReqBuf[i + 1].toString());
  }
  crequest.setHeader('modulekey', 'password');
  crequest.write(clientReq);
  crequest.end();
  modifiedReq = JSON.parse(JSON.stringify(crequest));

  return modifiedReq;
}; */

server.on('connection', (clientToProxySocket) => {
  console.log('Client is connected to proxy');

  clientToProxySocket.once('data', async (data) => {
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

    // Performance logging
    let reqMinusBody = data.slice(0, data.lastIndexOf('\r\n\r\n'));
    let reqHash = crypto.createHash('md5', reqMinusBody).digest('base64');
    console.log(`----\n${data.toString().slice(0, data.lastIndexOf('\r\n\r\n'))}\n----`);
    await fs.appendFile('log.txt', `${reqHash}\nTime received: ${new Date().getTime()}\nTime completed: `, (err) => {
      if (err) throw err;
      console.log('Log updated!');
    });

    // Write orig req data to socket
    try {
      console.log('TEST\n\n');
      proxyToApiSocket.write(data);
      clientToProxySocket.pipe(proxyToApiSocket);
    } catch (error) {
      console.error(error);
    }

    // Send final response to client
    proxyToApiSocket.on('data', (responseData) => {
      /* const testHeader = 'test: header\r\n\r\n';
      console.log(Buffer.byteLength(testHeader), data.lastIndexOf('\r\n\r\n'));
      const testBuf = Buffer.alloc(Buffer.byteLength(testHeader) + data.lastIndexOf('\r\n\r\n'));
      testBuf.fill(Buffer.from(data), 0, Buffer.byteLength(data) - Buffer.byteLength('\r\n'));
      console.log(JSON.stringify(data.toString()));
      testBuf.write(testHeader, Buffer.byteLength(data) - Buffer.byteLength('\r\n'));
      testBuf.write('\r\n', 143);
      console.log(JSON.stringify(testBuf.toString()), '-----'); */
      const validityStatus = responseData.toString().split('req-validation-status: ')[1].split('\r\n')[0];

      // Check if request was validated
      if (validityStatus === 'valid') {
        // console.log(data.toString());

        proxyToServerSocket.write(data);
        proxyToServerSocket.pipe(clientToProxySocket);
        clientToProxySocket.pipe(proxyToServerSocket);
      } else {
        clientToProxySocket.write('HTTP/1.1 400 Bad Request\r\n' + '\r\n');
        clientToProxySocket.write('Blocked request\r\n');
        clientToProxySocket.write(data);
        clientToProxySocket.end();
      }
      fs.appendFile('log.txt', `${new Date().getTime()}\n\n`, (err) => {
        if (err) throw err;
        console.log('Log updated!');
      });
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
