import apiRunnerNode from "../../api-runner-node"
import { build } from "../../../schema"
import { setState } from "./state"

export function setInferenceMetadata(): void {
  setState([`inferenceMetadata`])
}

export function setQueries(): void {
  setState([`components`, `staticQueryComponents`])
}

export async function buildSchema(): Promise<void> {
  setInferenceMetadata()

  await apiRunnerNode(`createSchemaCustomization`)

  await build({ fullMetadataBuild: false, parentSpan: {} })
}
