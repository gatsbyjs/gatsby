import apiRunnerNode from "./api-runner-node"
import { store } from "../redux"
import { Span } from "opentracing"

export const createSchemaCustomization = async ({
  refresh = false,
  parentSpan,
  deferNodeMutation,
}: {
  refresh?: boolean
  parentSpan?: Span
  deferNodeMutation?: boolean
}): Promise<void> => {
  if (refresh) {
    store.dispatch({ type: `CLEAR_SCHEMA_CUSTOMIZATION` })
  }
  await apiRunnerNode(`createSchemaCustomization`, {
    parentSpan,
    deferNodeMutation,
    traceId: !refresh
      ? `initial-createSchemaCustomization`
      : `refresh-createSchemaCustomization`,
  })
}
