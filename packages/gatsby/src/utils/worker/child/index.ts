import { isWorker } from "gatsby-worker"
import { initJobsMessagingInWorker } from "../../jobs/worker-messaging"
import { initReporterMessagingInWorker } from "../reporter"
import { listenForSegfaults } from "../../listen-for-segfaults"

// Top level await not defined, alternatively could refactor this to individual
// re-exported functions below. Better suggestions appreciated
listenForSegfaults(process.cwd())
  .then(() => init())
  .catch(() => init())

function init(): void {
  initJobsMessagingInWorker()
  initReporterMessagingInWorker()

  // set global gatsby object like we do in develop & build
  if (isWorker) {
    global.__GATSBY = process.env.GATSBY_NODE_GLOBALS
      ? JSON.parse(process.env.GATSBY_NODE_GLOBALS)
      : {}
  }
}

// Note: this doesn't check for conflicts between module exports
export { renderHTMLProd, renderHTMLDev } from "./render-html"
export { setInferenceMetadata, buildSchema } from "./schema"
export { setComponents, runQueries, saveQueriesDependencies } from "./queries"
export { loadConfigAndPlugins } from "./load-config-and-plugins"

// Let Gatsby force worker to grab latest version of `public/render-page.js`
export function deleteModuleCache(htmlComponentRendererPath: string): void {
  delete require.cache[require.resolve(htmlComponentRendererPath)]
}
