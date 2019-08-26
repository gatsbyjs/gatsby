import React from "react"
import { Link, graphql } from "gatsby"
import Img from "gatsby-image"

import styles from "./styles"
import {
  colors,
  transition,
  space,
  lineHeights,
  fonts,
} from "../../utils/presets"

const ThumbnailLink = ({ slug, image, title, children, state }) => {
  let screenshot = false

  // site showcase
  if (image.screenshotFile) {
    screenshot = image.screenshotFile.childImageSharp.fluid
  } else {
    // starter showcase
    screenshot = image.childImageSharp.fluid
  }

  return (
    <Link
      to={slug}
      state={{ isModal: true, ...state }}
      css={{
        ...styles.withTitleHover,
        lineHeight: lineHeights.dense,
        fontFamily: fonts.header,
        "&&": {
          borderBottom: `none`,
          color: colors.text.header,
          transition: `all ${transition.speed.default} ${transition.curve.default}`,
          "&:hover": { ...styles.screenshotHover },
          "&:hover ~ .meta > .featured-site": {
            transform: `translateY(-${space[1]})`,
          },
        },
      }}
    >
      {screenshot ? (
        <Img
          fluid={screenshot}
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
    fluid(maxWidth: 350, maxHeight: 260, cropFocus: NORTH) {
      ...GatsbyImageSharpFluid_noBase64
    }
  }
`
