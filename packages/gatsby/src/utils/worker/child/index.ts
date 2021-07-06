import reporter from "gatsby-cli/lib/reporter"
import signalExit from "signal-exit"

// Note: this doesn't check for conflicts between module exports
export { renderHTMLProd, renderHTMLDev } from "./render-html"
export { setInferenceMetadata, buildSchema } from "./schema"
export { setQueries, runQueries } from "./queries"
export { loadConfigAndPlugins } from "./load-config-and-plugins"

process.on(`unhandledRejection`, (reason: unknown) => {
  process.stdout.write(`[1] unhandledRejection\n`)
  reporter.panic((reason as Error) || `Unhandled rejection`)
})

process.on(`uncaughtException`, function (err) {
  process.stdout.write(`[1] uncaughtException\n`)
  reporter.panic(err)
})

signalExit((code, signal) => {
  process.stdout.write(
    `[inside] Worker ${
      process.env.GATSBY_WORKER_ID
    } exited with ${JSON.stringify({
      code,
      signal,
    })}\n`
  )
})
