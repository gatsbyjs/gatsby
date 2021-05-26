import type Worker from "jest-worker"

import type {
  renderHTMLProd,
  renderHTMLDev,
  buildSchema,
  loadConfig,
  warmup,
  setExtractedQueries,
  runQueries,
} from "./child"

export interface IGatsbyWorkerPool extends Worker {
  renderHTMLProd: typeof renderHTMLProd
  renderHTMLDev: typeof renderHTMLDev
  buildSchema: typeof buildSchema
  loadConfig: typeof loadConfig
  warmup: typeof warmup
  setExtractedQueries: typeof setExtractedQueries
  runQueries: typeof runQueries
}
export interface IWorkerRunAllContext {
  workerId: string
}
