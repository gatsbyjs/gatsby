import { GatsbyStateSlices, IGatsbyState } from "../../redux/types"
import { configureStore, GatsbyReduxStore } from "../../redux"
import { DeepPartial } from "redux"
// Note: this doesn't check for conflicts between module exports
export { renderHTMLProd, renderHTMLDev } from "./render-html"

const workerStore: GatsbyReduxStore = configureStore({} as IGatsbyState)

export function setState(slices: Array<GatsbyStateSlices>): void {
  // 1: Use "slices" to call loadStateInWorker(slices)
  // 2: Use that result to put something into workerStore
}

export function getState(): DeepPartial<IGatsbyState> {
  return workerStore.getState()
}
