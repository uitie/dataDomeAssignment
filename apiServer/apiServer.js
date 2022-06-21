const http = require('http');

const apiKey = 'password';
const host = 'localhost';
const port = 9000;

// event listener
const requestListener = ((req, res) => {
    console.log(req.headers);
    if(req.headers.modulekey == apiKey){
        res.writeHead(200);
        res.end('This is the API Server\n');
    } else {
        res.writeHead(401);
        res.end(`{"error": "${http.STATUS_CODES[401]}"}`);
    }
    
});

// create http server
const server = http.createServer(requestListener);

server.on('error', (err) => {
    console.log('API Server error');
    console.error(err);
});

server.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`API Server is running on http://${server.address().address}:${server.address().port}`);
});