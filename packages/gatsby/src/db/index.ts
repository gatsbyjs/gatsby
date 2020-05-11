import _ from "lodash"
import reporter from "gatsby-cli/lib/reporter"
import * as redux from "../redux"
// import { backend } from "./nodes"
const { emitter } = redux

let saveInProgress = false
export async function saveState(): Promise<void> {
  if (saveInProgress) return
  saveInProgress = true

  try {
    await redux.saveState()
  } catch (err) {
    reporter.warn(`Error persisting state: ${(err && err.message) || err}`)
  }

  saveInProgress = false
}
const saveStateDebounced = _.debounce(saveState, 1000)

/**
 * Starts listening to redux actions and triggers a database save to
 * disk upon any action (debounced to every 1 second)
 */
export function startAutosave(): void {
  saveStateDebounced()
  emitter.on(`*`, () => saveStateDebounced())
}
