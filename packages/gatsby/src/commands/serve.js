/* @flow weak */
const handler = require('serve-handler');
const http = require('http');
const signalExit = require(`signal-exit`)

module.exports = program => {
  let { port } = program
  port = typeof port === `string` ? parseInt(port, 10) : port

  let server = http.createServer((request, response) => {
    return handler(request, response, {
      "public": "public"
    });
  });

  server.listen(port, () => {
    console.log("gatsby serve running at port: ", port)
  });

  signalExit((code, signal) => {
    server.close();
  })
}
