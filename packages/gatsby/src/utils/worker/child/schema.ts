import { setState } from "./state"

export function setExtractedSlices(): void {
  setState([`components`, `staticQueryComponents`])
}

export function setInferenceMetadata(): void {
  setState([`inferenceMetadata`])
}
