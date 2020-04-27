import { createServer } from "http"
import httpProxy from "http-proxy"
import { jsx } from "theme-ui"
import { renderToString } from "react-dom/server"
import { getServices } from "gatsby-core-utils"
import RestartingScreen from "../utils/RestartingScreen"

interface IProxyControls {
  serveRestartingScreen: () => void
  serveSite: () => void
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
        require(`fs`).readFileSync(
          require.resolve(`socket.io-client/dist/socket.io.js`)
        )
      )
      return
    }

    if (shouldServeRestartingScreen) {
      res.end(renderToString(jsx(RestartingScreen)))
      return
    }

    proxy.web(req, res)
  })

  server.listen(input.proxyPort)

  return {
    serveRestartingScreen: (): void => {
      shouldServeRestartingScreen = true
    },
    serveSite: (): void => {
      shouldServeRestartingScreen = false
    },
  }
}
