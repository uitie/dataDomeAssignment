const http = require("http");
const host = 'localhost';
const port = 8000;

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