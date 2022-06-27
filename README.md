## Requirements

- Node v16+
- npm
- curl


## Instructions

1. Fork or clone this repo to your local machine.
2. Navigate to repo root on local machine and issue `npm i` command.
3. Open a new terminal, navigate to repo root and issue `npm run start` command.
4. In another terminal , navigate to */proxyModule* folder of repo and issue `node proxy.js` command.
5. In a third terminal, navigate to */apiServer* folder and issue `node apiServer.js` command.
6. In a new terminal window, send a request to the */cart* endpoint on the Customer API server via:
    `curl -v --proxy 'http://0.0.0.0:8080' --request-target '/cart' '127.0.0.1:8000' --header 'modulekey: password'`
    Note: The API Server is configured to only accept/validate **GET** requests that include the API key **modulekey: password** header key/value.
7. Hit `CTRL`/`CMD` + `C` keys to terminate the servers.


## Support

- Questions, comments, and concerns can be sent to [konst@ntinh.am](konst@ntinh.am)