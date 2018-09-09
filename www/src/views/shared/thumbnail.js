import React from "react"
import { Link, graphql } from "gatsby"
import Img from "gatsby-image"

import styles from "./styles"
import presets from "../../utils/presets"

const ThumbnailLink = ({ slug, image, title, children }) => {
  let screenshot = false

  // site showcase
  if (image.screenshotFile) {
    screenshot = image.screenshotFile.childImageSharp.fixed
  } else {
    // starter showcase
    screenshot = image.childImageSharp.fixed
  }

  return (
    <Link
      to={slug}
      state={{ isModal: true }}
      {...styles.withTitleHover}
      css={{
        "&&": {
          borderBottom: `none`,
          boxShadow: `none`,
          transition: `all ${presets.animation.speedDefault} ${
            presets.animation.curveDefault
          }`,
          "&:hover": { ...styles.screenshotHover },
          "&:hover ~ .meta > .featured-site": {
            transform: `translateY(-3px)`,
          },
        },
      }}
    >
      {screenshot ? (
        <Img
          fixed={screenshot}
          alt={`Screenshot of ${title}`}
          css={{ ...styles.screenshot }}
        />
      ) : (
        <div
          css={{
            width: 320,
            backgroundColor: `#d999e7`,
          }}
        >
          missing
        </div>
      )}
      {children}
    </Link>
  )
}

export default ThumbnailLink

export const showcaseThumbnailFragment = graphql`
  fragment ShowcaseThumbnailFragment_item on ImageSharp {
    fixed(width: 282, height: 211) {
      ...GatsbyImageSharpFixed_noBase64
    }
  }
`
