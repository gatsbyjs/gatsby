import { GatsbyStateKeys } from "../../../redux/types"
import { loadPartialStateFromDisk, store } from "../../../redux"

// Calls loadPartialStateFromDisk(slices) and mutates the redux store with the results
export function setState(slices: Array<GatsbyStateKeys>): void {
  const res = loadPartialStateFromDisk(slices)

  Object.entries(res).forEach(([key, val]) => {
    store.getState()[key] = val
  })
}
