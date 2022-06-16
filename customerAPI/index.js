const http = require('http');

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 8000;

// event listener
const requestListener = ((req, res) => {
  if (req.url === '/cart') {
    res.writeHead(200);
    res.end('This is the /cart endpoint');
  } else {
    res.end(`{"error": "${http.STATUS_CODES[404]}"}`);
  }
});

// create http server
const server = http.createServer(requestListener);
server.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://${host}:${port}`);
});

exports.server = server;
