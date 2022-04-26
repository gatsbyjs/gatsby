import { ScriptStrategy } from "gatsby"
import { InlineScript } from "./scripts"

/**
 * Naming matches `PerformanceResourceTiming` interface.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming}
 */
export enum ResourceRecord {
  fetchStart = `fetch-start`,
  responseEnd = `response-end`,
}

export interface PerformanceMarkWithDetails extends PerformanceMark {
  detail: {
    strategy: ScriptStrategy
    type: InlineScript
    executeStart: DOMHighResTimeStamp
  }
}

export enum MarkRecord {
  executeStart = `execute-start`,
}
