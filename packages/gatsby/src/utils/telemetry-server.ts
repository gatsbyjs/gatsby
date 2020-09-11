/*
 * This exposes gatsby-telemetry functions over HTTP. POST an array of arguments to the path.
 * For example:
 * curl -X POST http://localhost:2345/setVersion
 *   -H "Content-Type: application/json"
 *   -d "[\"1.2.3\"]"
 */
import express from "express"
import bodyParser from "body-parser"
import {
  setGatsbyCliVersion,
  setDefaultComponentId,
  trackCli,
  startBackgroundUpdate,
} from "gatsby-telemetry"

// These routes will exist in the API at the keys, e.g.
// http://localhost:1234/trackEvent
const ROUTES = {
  setVersion: setGatsbyCliVersion,
  setDefaultComponentId: setDefaultComponentId,
  trackEvent: trackCli,
}

const port = process.env.PORT
if (!port)
  throw new Error(
    `Please specify the PORT environment variable to use the telemetry-server.`
  )
const app = express()

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

startBackgroundUpdate()
app.listen(port)
console.log(`Telemetry service listening at http://localhost:${port}.`)
