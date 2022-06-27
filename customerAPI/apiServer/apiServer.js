require('dotenv').config();
const http = require('http');

const apiKey = 'password';
const host = process.env.APISERVERHOST || 'localhost';
const port = process.env.APISERVERPORT || 9000;

// create http server
const server = http.createServer();

// request validation
const validate = ((req, res) => {
  if (req.socket.localAddress === '::1'
        && req.method === ('GET')
        && req.headers['user-agent'].indexOf('curl') !== -1
  ) {
    res.setHeader('req-validation-status', 'valid');
  } else {
    res.setHeader('req-validation-status', 'blocked');
  }
});

// event listener
server.on('request', (req, res) => {
  console.log(req.headers);
  // authentication
  if (req.headers.modulekey === apiKey) {
    console.log(req.socket.localAddress, req.method, req.headers);

    validate(req, res);

    res.setHeader('Content-type', 'application/json');
    res.statusCode = 302;
    res.end('This is the API Server\n');
  } else {
    res.writeHead(401);
    res.end(`{"error": "${http.STATUS_CODES[401]}"}`);
  }
});

server.on('error', (err) => {
  console.log('API Server error');
  console.error(err);
});

server.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`API Server is running on http://${server.address().address}:${server.address().port}`);
});
