import { setState } from "./state"

export function setExtractedSlices(): void {
  setState([`components`, `staticQueryComponents`])
}
