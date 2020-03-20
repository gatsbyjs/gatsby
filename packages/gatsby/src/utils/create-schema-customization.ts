import apiRunnerNode from "./api-runner-node"
import { store } from "../redux"
import { Span } from "opentracing"

export const createSchemaCustomization = async ({
  refresh = false,
  parentSpan,
  webhookBody,
}: {
  refresh?: boolean
  parentSpan?: Span
  webhookBody?: Record<string, any>
}): Promise<void> => {
  if (refresh) {
    store.dispatch({ type: `CLEAR_SCHEMA_CUSTOMIZATION` })
  }
  await apiRunnerNode(`createSchemaCustomization`, {
    parentSpan,
    webhookBody,
    traceId: !refresh
      ? `initial-createSchemaCustomization`
      : `refresh-createSchemaCustomization`,
  })
}
