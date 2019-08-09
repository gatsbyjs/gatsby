import React from "react"
import { fontSizes, space } from "../../utils/presets"

const FeaturesFooter = () => (
  <p css={{ fontSize: fontSizes[1], marginTop: space[8] }}>
    Want to help keep this information complete, accurate, and up-to-date?
    Please comment
    {` `}
    <a
      href="https://github.com/gatsbyjs/gatsby/issues/16233"
      target="_blank"
      rel="noopener noreferrer"
    >
      here.
    </a>
  </p>
)

export default FeaturesFooter
