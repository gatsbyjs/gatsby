import report from "gatsby-cli/lib/reporter"
import { captureEvent } from "gatsby-telemetry"
import { saveState as reduxSaveState } from "./"

let saveInProgress = false
export function saveState(): void {
  if (saveInProgress) return
  saveInProgress = true

  const startTime = Date.now()

  try {
    reduxSaveState()
  } catch (err) {
    report.warn(`Error persisting state: ${(err && err.message) || err}`)
  }

  try {
    const duration = (Date.now() - startTime) / 1000
    captureEvent(`INTERNAL_STATE_PERSISTENCE_DURATION`, {
      name: `Save Internal State`,
      duration: Math.round(duration),
    })
  } catch (err) {
    console.error(err)
  }

  saveInProgress = false
}
