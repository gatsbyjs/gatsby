import http from "http"
import https from "https"
import httpProxy from "http-proxy"
import path from "path"
import fs from "fs-extra"
import { getServices } from "gatsby-core-utils/dist/service-lock"
import st from "st"
import restartingScreen from "./restarting-screen"
import { IProgram } from "../commands/types"

interface IProxyControls {
  serveRestartingScreen: () => void
  serveSite: () => void
  refreshEnded: () => void
  server: any
}

const noop = (): void => {}

const adminFolder = path.join(
  path.dirname(require.resolve(`gatsby-admin`)),
  `public`
)

const serveAdmin = st({
  path: adminFolder,
  url: `/___admin`,
  index: `index.html`,
})

export const startDevelopProxy = (input: {
  proxyPort: number
  targetPort: number
  program: IProgram
}): IProxyControls => {
  let shouldServeRestartingScreen = false
  let isRefreshing = false
  const refreshQueue: {
    res: http.ServerResponse
    req: http.IncomingMessage
    body: string
  }[] = []

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

  const app: http.RequestListener = (req, res): void => {
    if (process.env.GATSBY_EXPERIMENTAL_ENABLE_ADMIN) {
      const wasAdminRequest = serveAdmin(req, res)
      if (wasAdminRequest) {
        return
      }
    }

    // Add a route at localhost:8000/___services for service discovery
    if (req.url === `/___services`) {
      getServices(input.program.directory).then(services => {
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

    /**
     * Refresh external data sources.
     * This behavior is disabled by default, but the ENABLE_GATSBY_REFRESH_ENDPOINT env var enables it
     * If no GATSBY_REFRESH_TOKEN env var is available, then no Authorization header is required
     **/
    const REFRESH_ENDPOINT = `/__refresh`
    if (req.url === REFRESH_ENDPOINT) {
      const enableRefresh = process.env.ENABLE_GATSBY_REFRESH_ENDPOINT
      const refreshToken = process.env.GATSBY_REFRESH_TOKEN
      const authorizedRefresh =
        !refreshToken || req.headers.authorization === refreshToken

      if (!enableRefresh || !authorizedRefresh) {
        return
      }

      readRequestBody(req).then((body: string) => {
        const isRequestWithSameBodyQueued = !!refreshQueue.filter(
          queued => queued.body === body
        ).length

        if (!isRequestWithSameBodyQueued) {
          refreshQueue.push({ req, res, body })
        }

        if (isRefreshing) {
          if (isRequestWithSameBodyQueued) {
            res.end(
              `already queued ${JSON.stringify(refreshQueue.map(q => q.body))}`
            )
            return
          }
          res.end(`queued ${JSON.stringify(refreshQueue.map(q => q.body))}`)
          return
        }

        isRefreshing = true
        const queued = refreshQueue.shift()
        if (queued) {
          proxy.web(queued.req, queued.res)
        }
      })

      return
    }

    const canShowRestartingScreenOnRefresh = !!process.env
      .ENABLE_GATSBY_RESTARTING_SCREEN_ON_REFRESH

    if (
      (isRefreshing && canShowRestartingScreenOnRefresh) ||
      shouldServeRestartingScreen ||
      req.url === `/___debug-restarting-screen`
    ) {
      res.end(restartingScreen)
      return
    }

    proxy.web(req, res)
  }

  function readRequestBody(request: http.IncomingMessage): Promise<string> {
    return new Promise(resolve => {
      let body = ``
      request.on(`data`, chunk => {
        body += chunk.toString()
      })
      request.on(`end`, () => {
        resolve(body)
      })
    })
  }

  const server = input.program.ssl
    ? https.createServer(input.program.ssl, app)
    : http.createServer(app)

  server.on(`upgrade`, function (req, socket, head) {
    proxy.ws(req, socket, head)
  })

  server.listen(input.proxyPort, input.program.host)

  return {
    server,
    serveRestartingScreen: (): void => {
      shouldServeRestartingScreen = true
    },
    serveSite: (): void => {
      shouldServeRestartingScreen = false
    },
    refreshEnded: (): void => {
      if (!refreshQueue.length) {
        isRefreshing = false
      } else {
        const queued = refreshQueue.shift()
        if (queued) {
          proxy.web(queued.req, queued.res)
        }
      }
    },
  }
}
