const http = require('http');
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 8000;
//event listener
const requestListener = function (req, res) {
    res.writeHead(200);
    res.end("My first server!");
};

//create http server
const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

exports.server = server;