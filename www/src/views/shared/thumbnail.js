/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { Link, graphql } from "gatsby"
import Img from "gatsby-image"

import styles from "./styles"

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
      sx={{
        ...styles.withTitleHover,
        lineHeight: `dense`,
        fontFamily: `header`,
        "&&": {
          borderBottom: `none`,
          color: `text.header`,
          transition: t =>
            `all ${t.transition.speed.default} ${t.transition.curve.default}`,
          "&:hover": { ...styles.screenshotHover },
          "&:hover ~ .meta > .featured-site": {
            transform: t => `translateY(-${t.space[1]})`,
          },
        },
      }}
    >
      {screenshot ? (
        <Img
          fluid={screenshot}
          alt={`Screenshot of ${title}`}
          sx={styles.screenshot}
        />
      ) : (
        <div sx={{ width: 320, bg: `grey.10` }}>missing</div>
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
