import { setState } from "./state"

export function setQueries(): void {
  setState([`components`, `staticQueryComponents`])
}
