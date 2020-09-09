/*
 * This exposes gatsby-telemetry functions over HTTP. POST an array of arguments to the path.
 * For example:
 * curl -X POST http://localhost:2345/setGatsbyCliVersion
 *   -H "Content-Type: application/json"
 *   -d "[\"1.2.3\"]"
 */
import express from "express"
import bodyParser from "body-parser"
import detectPort from "detect-port"
import { setGatsbyCliVersion, setDefaultComponentId, trackCli } from "./"

const PORT = Promise.resolve(Number(process.env.PORT) || detectPort())
const ROUTES = {
  setGatsbyCliVersion: setGatsbyCliVersion,
  setDefaultComponentId: setDefaultComponentId,
  trackCli: trackCli,
}

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

PORT.then(port => {
  app.listen(port)
  console.log(`Telemetry service listening at http://localhost:${port}.`)
})
