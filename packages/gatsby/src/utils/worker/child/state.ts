// Calls loadStateInWorker(slices) and mutates the redux store with the results
import { GatsbyStateKeys } from "../../../redux/types"
import { loadStateInWorker, store } from "../../../redux"

export function setState(slices: Array<GatsbyStateKeys>): void {
  const res = loadStateInWorker(slices)

  Object.entries(res).forEach(([key, val]) => {
    store.getState()[key] = val
  })
}
