const http = require(`http`)
const httpProxy = require("http-proxy")

const proxy = httpProxy.createProxyServer()
const server = http.createServer((request, response) =>
  proxy.web(request, response, { target: "http://localhost:9000" })
)

server.listen(9001, () => {
  console.log(`Running at http://localhost:9001`)
})
