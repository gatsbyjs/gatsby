import { collectedScriptsByPage } from "gatsby-script"
import { injectPartytownSnippet } from "./utils/inject-partytown-snippet"
import type { GatsbyBrowser } from "gatsby"

export const onInitialClientRender: GatsbyBrowser[`onInitialClientRender`] =
  (): void => {
    injectPartytownSnippet(collectedScriptsByPage.get(window.location.pathname))

    // Clear scripts after we've used them to avoid leaky behavior
    collectedScriptsByPage.delete(window.location.pathname)
  }

export const onRouteUpdate: GatsbyBrowser[`onRouteUpdate`] = ({
  prevLocation,
  location,
}): void => {
  if (!prevLocation) {
    return
  }

  // Wait one tick so scripts are collected, then re-initialize Partytown with forwards for the navigated-to page
  setTimeout(() => {
    injectPartytownSnippet(collectedScriptsByPage.get(location.pathname))

    // Clear scripts after we've used them to avoid leaky behavior
    collectedScriptsByPage.delete(location.pathname)
  }, 0)
}
