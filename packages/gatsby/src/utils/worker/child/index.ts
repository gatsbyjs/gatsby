import reporter from "gatsby-cli/lib/reporter"
import signalExit from "signal-exit"

// Note: this doesn't check for conflicts between module exports
export { renderHTMLProd, renderHTMLDev } from "./render-html"
export { setInferenceMetadata, buildSchema } from "./schema"
export { setQueries, runQueries } from "./queries"
export { loadConfigAndPlugins } from "./load-config-and-plugins"

process.on(`unhandledRejection`, (reason: unknown) => {
  reporter.panic((reason as Error) || `Unhandled rejection`)
})

process.on(`uncaughtException`, function (err) {
  reporter.panic(err)
})

signalExit((code, signal) => {
  reporter.verbose(
    `Worker ${process.env.GATSBY_WORKER_ID} exitted with ${JSON.stringify({
      code,
      signal,
    })}`
  )
})
