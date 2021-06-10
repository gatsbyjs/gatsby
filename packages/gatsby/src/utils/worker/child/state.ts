// Calls loadStateInWorker(slices) and mutates the redux store with the results
import { GatsbyStateSlices } from "../../../redux/types"
import { loadStateInWorker, store } from "../../../redux"

export function setState(slices: Array<GatsbyStateSlices>): void {
  const res = loadStateInWorker(slices)

  Object.entries(res).forEach(([key, val]) => {
    store.getState()[key] = val
  })
}
