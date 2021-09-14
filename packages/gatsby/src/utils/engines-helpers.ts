import { store } from "../redux"
import memoize from "memoizee"

// Memoize assuming pages cannot change during the build command
export const shouldGenerateEngines = memoize(shouldGenerateEnginesImpl)

function shouldGenerateEnginesImpl(): boolean {
  return process.env.gatsby_executing_command === `build` && hasDynamicPage()
}

function hasDynamicPage(): boolean {
  const { pages } = store.getState()
  for (const page of pages.values()) {
    if (page.mode !== `SSG`) {
      return true
    }
  }
  return false
}
