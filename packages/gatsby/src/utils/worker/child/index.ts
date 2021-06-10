import { GatsbyStateSlices } from "../../../redux/types"
import { loadStateInWorker, store } from "../../../redux"
// Note: this doesn't check for conflicts between module exports
export { renderHTMLProd, renderHTMLDev } from "./render-html"

// Calls loadStateInWorker(slices) and mutates the redux store with the results
export function setState(slices: Array<GatsbyStateSlices>): void {
  const res = loadStateInWorker(slices)

  Object.entries(res).forEach(([key, val]) => {
    store.getState()[key] = val
  })
}

export { loadConfigAndPlugins } from "./load-config-and-plugins"
