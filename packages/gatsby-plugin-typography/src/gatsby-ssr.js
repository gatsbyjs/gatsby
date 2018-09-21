import React from "react"
import { TypographyStyle, GoogleFont } from "react-typography"
import typography from "./.cache/typography"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  const googleFont = pluginOptions.omitGoogleFont ? (
    []
  ) : (
    <GoogleFont key={`GoogleFont`} typography={typography} />
  )
  setHeadComponents([
    <TypographyStyle key={`TypographyStyle`} typography={typography} />,
    ...googleFont,
  ])
}
