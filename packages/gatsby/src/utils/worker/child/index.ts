import { initJobsMessagingInWorker } from "../../jobs/worker-messaging"
import { initReporterMessagingInWorker } from "../reporter"

initJobsMessagingInWorker()
initReporterMessagingInWorker()

// Note: this doesn't check for conflicts between module exports
export { renderHTMLProd, renderHTMLDev } from "./render-html"
export { setInferenceMetadata, buildSchema } from "./schema"
export { setComponents, runQueries, saveQueries } from "./queries"
export { loadConfigAndPlugins } from "./load-config-and-plugins"
