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

  proxy.on(`error`, (_, __, res) => {
    res.end(renderToString(jsx(RestartingScreen)))
  })
}
