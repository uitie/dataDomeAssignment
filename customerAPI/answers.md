# Q & A

 1. Q: Explain what part of the original request (headers, body, IP address... etc) the module should send to the API server? Provide the rationale for each piece of data sent to the API server.
A:  **At the moment, the entire original request is being sent over. The plan is to only send the original headers, but I'm having some trouble modifying the HTTP.IncomingMessage Object as part of the tcp stream without creating an additional http client.**

 2. Q: How can you make sure only the module can securely communicate with the API
server?
A: **Adding a (dummy) API key to the header of the request which is then verified by the API server.**

 3. Q: How would the client react to a rejected request?
 A: **Client receives an HTTP 400 error.**

 4. Q: Are requests to the API server synchronous or asynchronous?
 A: **Requests to the API server are sent via piping of async streams that are native to the built-in node 'net' module.**

 5. Q: How do you evaluate the performance of your solution?
 A: **The request, minus the body (if any), is hashed. Said hash is written to the *log.txt* file along with a timestamp when the request is forwarded to the API Server. An additional timestamp is generated and appended to the log under the relevant hash when the request is completed.**