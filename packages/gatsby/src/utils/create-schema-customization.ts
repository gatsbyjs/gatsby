import apiRunnerNode from "./api-runner-node"
import { store } from "../redux"
import { Span } from "opentracing"

export const createSchemaCustomization = async ({
  refresh = false,
  parentSpan,
}: {
  refresh?: boolean
  parentSpan?: Span
}): Promise<void> => {
  if (refresh) {
    store.dispatch({ type: `CLEAR_SCHEMA_CUSTOMIZATION` })
  }
  await apiRunnerNode(`createSchemaCustomization`, {
    parentSpan,
    traceId: !refresh
      ? `initial-createSchemaCustomization`
      : `refresh-createSchemaCustomization`,
  })
}
