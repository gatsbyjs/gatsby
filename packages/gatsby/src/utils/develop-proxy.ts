import httpProxy from "http-proxy"
import { jsx } from "theme-ui"
import { renderToString } from "react-dom/server"
import RestartingScreen from "../utils/RestartingScreen"

export const startDevelopProxy = (ports: {
  proxyPort: number
  targetPort: number
}): void => {
  const proxy = httpProxy
    .createProxyServer({
      target: `http://localhost:${ports.targetPort}`,
      changeOrigin: true,
      preserveHeaderKeyCase: true,
      autoRewrite: true,
    })
    .listen(ports.proxyPort)

  proxy.on(`error`, (_, req, res) => {
    console.log(req.url)
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
