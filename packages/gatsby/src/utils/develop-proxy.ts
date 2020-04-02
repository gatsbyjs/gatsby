import httpProxy from "http-proxy"

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

  proxy.on(`error`, (err, req, res) => {
    res.end(`Loading...`)
  })
}
