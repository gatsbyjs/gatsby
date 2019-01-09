import React from "react"
import { TypographyStyle, GoogleFont } from "react-typography"
import typography from "./.cache/typography"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  const googleFont = pluginOptions.omitGoogleFont ? (
    []
  ) : (
    <GoogleFont key={`GoogleFont`} typography={typography} />
  )
  if (process.env.BUILD_STAGE === `build-html`) {
    setHeadComponents([
      <TypographyStyle key={`TypographyStyle`} typography={typography} />,
      ...googleFont,
    ])
  }
}
