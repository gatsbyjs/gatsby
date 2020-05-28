import { createServer } from "http"
import httpProxy from "http-proxy"
import fs from "fs-extra"
import { getServices } from "gatsby-core-utils/dist/service-lock"
import restartingScreen from "./restarting-screen"

interface IProxyControls {
  serveRestartingScreen: () => void
  serveSite: () => void
  server: any
}

const noop = (): void => {}

export const startDevelopProxy = (input: {
  proxyPort: number
  targetPort: number
  programPath: string
}): IProxyControls => {
  let shouldServeRestartingScreen = false

  const proxy = httpProxy.createProxyServer({
    target: `http://localhost:${input.targetPort}`,
    changeOrigin: true,
    preserveHeaderKeyCase: true,
    autoRewrite: true,
    ws: true,
  })

  // Noop on proxy errors, as this throws a bunch of "Socket hang up"
  // ones whenever the page is refreshed
  proxy.on(`error`, noop)

  const server = createServer((req, res) => {
    // Add a route at localhost:8000/___services for service discovery
    if (req.url === `/___services`) {
      getServices(input.programPath).then(services => {
        res.setHeader(`Content-Type`, `application/json`)
        res.end(JSON.stringify(services))
      })
      return
    }

    if (req.url === `/socket.io/socket.io.js`) {
      res.end(
        fs.readFileSync(require.resolve(`socket.io-client/dist/socket.io.js`))
      )
      return
    }

    if (
      shouldServeRestartingScreen ||
      req.url === `/___debug-restarting-screen`
    ) {
      res.end(restartingScreen)
      return
    }

    proxy.web(req, res)
  })

  server.on(`upgrade`, function (req, socket, head) {
    proxy.ws(req, socket, head)
  })

  server.listen(input.proxyPort)

  return {
    server,
    serveRestartingScreen: (): void => {
      shouldServeRestartingScreen = true
    },
    serveSite: (): void => {
      shouldServeRestartingScreen = false
    },
  }
}
