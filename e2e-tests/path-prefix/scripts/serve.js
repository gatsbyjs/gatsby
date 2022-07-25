const http = require(`http`)
const httpProxy = require("http-proxy")
const waitOn = require("wait-on")

waitOn(
  {
    resources: [`http://localhost:9000/blog/`],
  },
  function (err) {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    const proxy = httpProxy.createProxyServer()
    const server = http.createServer((request, response) =>
      proxy.web(request, response, { target: "http://localhost:9000" })
    )

    server.listen(9001, () => {
      console.log(`Assets server running at http://localhost:9001`)
    })
  }
)
