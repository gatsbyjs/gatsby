import { Span } from "opentracing"
import { apiRunnerNode } from "./api-runner-node"

// eslint-disable-next-line @typescript-eslint/naming-convention
import Promise from "bluebird"

type SourceNodesApiRunnerConfig = {
  traceId: string
  webhookBody: unknown
  pluginName?: string
  parentSpan?: Span
  deferNodeMutation?: boolean
}

export function sourceNodesApiRunner({
  traceId,
  deferNodeMutation,
  parentSpan,
  webhookBody,
  pluginName,
}: SourceNodesApiRunnerConfig): Promise<unknown> | null {
  return apiRunnerNode(`sourceNodes`, {
    traceId,
    waitForCascadingActions: true,
    deferNodeMutation,
    parentSpan,
    webhookBody: webhookBody || {},
    pluginName,
  })
}
