import { IWorkerRunAllContext } from "./types"

// Note: this doesn't check for conflicts between module exports
export { renderHTMLProd, renderHTMLDev } from "./render-html"
export { buildSchema, setExtractedQueries } from "./child-schema"
export { loadConfig } from "./child-load-config"
export { runQueries } from "./run-quries"
import { initMessaging } from "./shared-db"

export function warmup(_context: IWorkerRunAllContext): void {
  // console.log(`[warmup] ${process.env.JEST_WORKER_ID}`)
}

export function setup(): void {
  initMessaging(false)
}
