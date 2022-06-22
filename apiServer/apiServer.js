const http = require('http');

const apiKey = 'password';
const host = 'localhost';
const port = 9000;

// create http server
const server = http.createServer();

//request validation
const validate = ((req, res) => {
    if(req.socket.localAddress === '::1'
        && req.method === 'GET'
        && req.headers['user-agent'].indexOf('Postman') !== -1
    ){
        res.setHeader('req-validation-status', 'valid');
    } else {
        res.setHeader('req-validation-status', 'blocked');
    }
});

// event listener
server.on('request', (req, res) => {
    console.log(req.headers);

    //authentication
    if(req.headers.modulekey == apiKey){
        console.log(req.socket.localAddress, req.method);
        validate(req, res);
        res.writeHead(200);
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