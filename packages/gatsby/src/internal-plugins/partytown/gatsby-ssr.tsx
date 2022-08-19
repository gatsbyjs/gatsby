import React from "react"
import { collectedScriptsByPage } from "gatsby-script"
import { getForwards } from "./utils/get-forwards"
import { partytownSnippet } from "@builder.io/partytown/integration"
import type { GatsbySSR } from "gatsby"

export const onRenderBody: GatsbySSR[`onRenderBody`] = ({
  pathname,
  setHeadComponents,
}) => {
  const collectedScripts = collectedScriptsByPage.get(pathname)

  if (!collectedScripts?.length) {
    return
  }

  const forwards = getForwards(collectedScripts)

  // Adapted from https://github.com/BuilderIO/partytown/blob/main/src/react/snippet.tsx to only include SSR logic
  setHeadComponents([
    <script
      key="partytown"
      data-partytown=""
      suppressHydrationWarning={true}
      dangerouslySetInnerHTML={{
        __html: `
          ${partytownSnippet({ forward: forwards })}
          document.currentScript.dataset.partytown=""
        `,
      }}
    />,
  ])

  // Clear scripts after we've used them to avoid leaky behavior
  collectedScriptsByPage.delete(pathname)
}
