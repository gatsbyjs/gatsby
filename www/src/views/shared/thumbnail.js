/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link, graphql } from "gatsby"
import Img from "gatsby-image"

import {
  screenshot as screenshotStyles,
  screenshotHover,
  withTitleHover,
} from "./styles"

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
        ...withTitleHover,
        lineHeight: `dense`,
        fontFamily: `heading`,
        "&&": {
          borderBottom: `none`,
          color: `heading`,
          transition: `default`,
          "&:hover": screenshotHover,
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
          sx={screenshotStyles}
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
