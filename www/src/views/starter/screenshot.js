import React from "react"
import sharedStyles from "../shared/styles"
import Img from "gatsby-image"

const Screenshot = ({ imageSharp }) => (
  <div
    className="screenshot"
    css={{
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
