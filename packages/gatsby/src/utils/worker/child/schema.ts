import { store } from "../../../redux"
import { build } from "../../../schema"
import apiRunnerNode from "../../api-runner-node"
import { setState } from "./state"

export function setInferenceMetadata(): void {
  setState([`inferenceMetadata`])
}

export async function buildSchema(): Promise<void> {
  const workerStore = store.getState()

  // pathPrefix: '' will at least be defined when config is loaded
  if ((workerStore?.config?.pathPrefix ?? null) === null) {
    throw Error(
      `Config loading didn't finish before attempting to build schema in worker`
    )
  }

  setInferenceMetadata()

  await apiRunnerNode(`createSchemaCustomization`)

  // build() runs other lifecycles like "createResolvers" or "setFieldsOnGraphQLNodeType" internally
  await build({ fullMetadataBuild: false, parentSpan: {} })
}
