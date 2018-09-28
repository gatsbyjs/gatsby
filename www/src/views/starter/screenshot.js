import React from "react"
import { colors } from "../../utils/presets"
import sharedStyles from "../shared/styles"
import Img from "gatsby-image"

const Screenshot = ({ imageSharp }) => (
  <div
    className="screenshot"
    css={{
      borderTop: `1px solid ${colors.ui.light}`,
      position: `relative`,
    }}
  >
    {imageSharp && (
      <Img
        fluid={imageSharp.childImageSharp.fluid}
        alt={`Screenshot of ${imageSharp.name}`}
        css={{
          ...sharedStyles.screenshot,
        }}
      />
    )}
  </div>
)

export default Screenshot
