import { collectedScriptsByPage } from "gatsby-script"
import { injectPartytownSnippet } from "./utils/inject-partytown-snippet"
import type { GatsbyBrowser } from "gatsby"

export const onInitialClientRender: GatsbyBrowser[`onInitialClientRender`] =
  (): void => {
    injectPartytownSnippet(window.location.pathname)
    collectedScriptsByPage.delete(window.location.pathname)
  }

export const onRouteUpdate: GatsbyBrowser[`onRouteUpdate`] = ({
  prevLocation,
  location,
}): void => {
  if (!prevLocation) {
    return
  }

  collectedScriptsByPage.delete(window.location.pathname)

  setTimeout(() => {
    injectPartytownSnippet(location.pathname)
  }, 0)
}
