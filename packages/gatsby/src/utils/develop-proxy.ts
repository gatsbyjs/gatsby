import { createServer } from "http"
import httpProxy from "http-proxy"
import { jsx } from "theme-ui"
import { renderToString } from "react-dom/server"
import { getServices } from "gatsby-core-utils"
import RestartingScreen from "../utils/RestartingScreen"

export const startDevelopProxy = (input: {
  proxyPort: number
  targetPort: number
  programPath: string
}): void => {
  const proxy = httpProxy.createProxyServer({
    target: `http://localhost:${input.targetPort}`,
    changeOrigin: true,
    preserveHeaderKeyCase: true,
    autoRewrite: true,
  })

  const server = createServer((req, res) => {
    if (req.url === `/___services`) {
      getServices(input.programPath).then(services => {
        res.setHeader(`Content-Type`, `application/json`)
        res.end(JSON.stringify(services))
      })
      return
    }

    proxy.web(req, res)
  })

  // TODO: Fix websocket server proxying

  server.listen(input.proxyPort)

  proxy.on(`error`, (_, req, res) => {
    if (req.url && req.url.indexOf(`socket.io.js`) > -1) {
      res.end(
        require(`fs`).readFileSync(
          require.resolve(`socket.io-client/dist/socket.io.js`)
        )
      )
      return
    }
    res.end(renderToString(jsx(RestartingScreen)))
  })
}
