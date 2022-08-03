import { Span } from "opentracing"
import apiRunner from "./api-runner-node"

export function sourceNodesApiRunner({
  traceId,
  deferNodeMutation,
  parentSpan,
  webhookBody,
  pluginName,
}: {
  traceId: string
  webhookBody: unknown
  pluginName?: string
  parentSpan?: Span
  deferNodeMutation?: boolean
}): Promise<void> {
  return apiRunner(`sourceNodes`, {
    traceId,
    waitForCascadingActions: true,
    deferNodeMutation,
    parentSpan,
    webhookBody: webhookBody || {},
    pluginName,
  })
}
