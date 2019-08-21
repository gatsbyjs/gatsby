import React from "react"
import Img from "gatsby-image"

import sharedStyles from "../shared/styles"

const Screenshot = ({ imageSharp, repoName }) => (
  <div
    className="screenshot"
    css={{
      position: `relative`,
    }}
  >
    {imageSharp && (
      <Img
        fluid={imageSharp.childImageSharp.fluid}
        alt={`Screenshot of ${repoName}`}
        css={{
          ...sharedStyles.screenshot,
        }}
      />
    )}
  </div>
)

export default Screenshot
