import { setState } from "./state"

export function setInferenceMetadata(): void {
  setState([`inferenceMetadata`])
}
export function setQueries(): void {
  setState([`components`, `staticQueryComponents`])
}
