import { GatsbyStateKeys } from "../../../redux/types"
import { loadStateInWorker, store } from "../../../redux"

// Calls loadStateInWorker(slices) and mutates the redux store with the results
export function setState(slices: Array<GatsbyStateKeys>): void {
  const res = loadStateInWorker(slices)

  Object.entries(res).forEach(([key, val]) => {
    store.getState()[key] = val
  })
}
