import React from "react"
import { TypographyStyle, GoogleFont } from "react-typography"
import typography from "typography-plugin-cache-endpoint"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  const googleFont = [].concat(
    pluginOptions.omitGoogleFont ? (
      []
    ) : (
      <GoogleFont key={`GoogleFont`} typography={typography} />
    )
  )
  setHeadComponents([
    <TypographyStyle key={`TypographyStyle`} typography={typography} />,
    ...googleFont,
  ])
}

// Move Typography.js styles to the top of the head section so they're loaded first
// and don't accidentally overwrite other styles. Typography.js is meant to
// be a configurable CSS reset so should always load first.
exports.onPreRenderHTML = ({ getHeadComponents, replaceHeadComponents }) => {
  const headComponents = getHeadComponents()
  headComponents.sort((x, y) => {
    if (x && x.key === `TypographyStyle`) {
      return -1
    } else if (y && y.key === `TypographyStyle`) {
      return 1
    }
    return 0
  })
  replaceHeadComponents(headComponents)
}
