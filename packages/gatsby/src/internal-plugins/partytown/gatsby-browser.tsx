import { collectedScriptsByPage } from "gatsby-script"
import { injectPartytownSnippet } from "./utils/inject-partytown-snippet"
import type { GatsbyBrowser } from "gatsby"

// Makes sure off-main-thread scripts are loaded in `gatsby develop`
export const onInitialClientRender: GatsbyBrowser[`onInitialClientRender`] =
  (): void => {
    if (process.env.NODE_ENV !== `development`) {
      return
    }

    injectPartytownSnippet(collectedScriptsByPage.get(window.location.pathname))

    // Clear scripts after we've used them to avoid leaky behavior
    collectedScriptsByPage.delete(window.location.pathname)
  }

// Client-side navigation (CSR, e.g. Gatsby Link navigations) are broken upstream in Partytown.
// We need an official API from Partytown for handling re-configuration and on-demand script loading.
// Until then, `off-main-thread` scripts load only on server-side navigation (SSR).
// See https://github.com/BuilderIO/partytown/issues/74 for more details.
