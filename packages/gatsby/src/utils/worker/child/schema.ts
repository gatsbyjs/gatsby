import { store } from "../../../redux"
import { build } from "../../../schema"
import apiRunnerNode from "../../api-runner-node"
import { setState } from "./state"

export function setInferenceMetadata(): void {
  setState([`inferenceMetadata`])
}

export async function buildSchema(): Promise<void> {
  const workerStore = store.getState()

  if (!workerStore?.config?.plugins) {
    throw Error(
      `Config loading didn't finish before attempting to build schema in worker`
    )
  }

  setInferenceMetadata()

  await apiRunnerNode(`createSchemaCustomization`)

  await build({ fullMetadataBuild: false, parentSpan: {} })
}
