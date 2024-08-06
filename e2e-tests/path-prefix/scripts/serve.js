const http = require('http');
const httpProxy = require('http-proxy');
const waitOn = require('wait-on');

// Define the target URL for the resource to wait on
const targetUrl = 'http://localhost:9000/blog/';

// Wait for the specified resource to become available
waitOn({ resources: [targetUrl] }, function (err) {
  if (err) {
    console.error('Error waiting for resource:', err);
    process.exit(1);
  }

  // Create a proxy server
  const proxy = httpProxy.createProxyServer();

  // Create an HTTP server and proxy the requests
  const server = http.createServer((request, response) => {
    proxy.web(request, response, { target: 'http://localhost:9000' }, (proxyErr) => {
      if (proxyErr) {
        console.error('Proxy error:', proxyErr);
        response.writeHead(502);
        response.end('Bad Gateway');
      }
    });
  });

  // Start the server and log the running message
  server.listen(9001, () => {
    console.log('Assets server running at http://localhost:9001');
  });

  // Handle server errors
  server.on('error', (serverErr) => {
    console.error('Server error:', serverErr);
    process.exit(1);
  });

  // Handle proxy errors
  proxy.on('error', (proxyErr) => {
    console.error('Proxy server error:', proxyErr);
  });
});
