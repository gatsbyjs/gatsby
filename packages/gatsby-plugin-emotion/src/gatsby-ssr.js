import React from "react"
import { renderToString } from "react-dom/server"
import { extractCritical } from "emotion-server"

import { wrapElement } from "./wrap-element"

export const replaceRenderer = ({
  bodyComponent,
  replaceBodyHTMLString,
  setHeadComponents,
}) => {
  const { html, ids, css } = extractCritical(
    renderToString(wrapElement(bodyComponent))
  )

  setHeadComponents([
    // eslint-disable-next-line react/jsx-key
    <style
      data-emotion-css={ids.join(` `)}
      dangerouslySetInnerHTML={{ __html: css }}
    />,
  ])

  replaceBodyHTMLString(html)
}
