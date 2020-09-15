/*
 * This exposes gatsby-telemetry functions over HTTP. POST an array of arguments to the path.
 * For example:
 * curl -X POST http://localhost:2345/setVersion
 *   -H "Content-Type: application/json"
 *   -d "[\"1.2.3\"]"
 */
import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import {
  setDefaultComponentId,
  trackCli,
  trackError,
  startBackgroundUpdate,
} from "gatsby-telemetry"

setDefaultComponentId(`gatsby-admin`)

// These routes will exist in the API at the keys, e.g.
// http://localhost:1234/trackEvent
const ROUTES = {
  trackEvent: trackCli,
  trackError,
}

const app = express()

app.use(cors())

// Overview over all possible routes at /
app.get(`/`, (req, res) => {
  res.set(`Content-Type`, `text/html`)
  res.send(
    `<ul>
      ${Object.keys(ROUTES)
        .map(route => `<li><a href="/${route}">/${route}</a></li>`)
        .join(`\n`)}
    </ul>`
  )
})

Object.keys(ROUTES).map(route => {
  app.post(`/${route}`, bodyParser.json(), (req, res) => {
    if (!req.body || !Array.isArray(req.body)) {
      res.json({
        status: `error`,
        error: `Please provide a body array with the arguments for the function.`,
      })
      return
    }

    try {
      ROUTES[route](...req.body)
    } catch (err) {
      console.error(err)
      res.json({ status: `error`, error: err.message })
      return
    }

    res.json({ status: `success` })
  })
})

export default function startTelemetryServer(port: number): void {
  startBackgroundUpdate()
  app.listen(port)
}
