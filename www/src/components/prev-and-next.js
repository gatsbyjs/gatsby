import React from "react"
import { Link } from "gatsby"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"
import ArrowBackIcon from "react-icons/lib/md/arrow-back"

import {
  colors,
  space,
  mediaQueries,
  lineHeights,
  fontSizes,
  fonts,
} from "../utils/presets"

const prevNextLinkStyles = {
  // bump specificity to override the border applied to Link's by default
  "&&": {
    borderBottom: 0,
  },
  color: colors.gatsby,
  fontFamily: fonts.header,
  fontSize: fontSizes[3],
  fontWeight: `bold`,
  lineHeight: lineHeights.dense,
}
const prevNextLabelStyles = {
  color: colors.text.secondary,
  fontSize: fontSizes[2],
  fontWeight: `normal`,
  marginBottom: space[2],
  marginTop: 0,
}

const PrevAndNext = ({ prev = null, next = null, ...props }) => {
  if (!prev && !next) {
    return null
  }

  return (
    <nav
      aria-label="pagination"
      css={{
        [mediaQueries.sm]: {
          display: `flex`,
          width: `100%`,
        },
      }}
      {...props}
    >
      <div css={{ [mediaQueries.sm]: { width: `50%` } }}>
        {prev && (
          <Link to={prev.link} css={prevNextLinkStyles}>
            <h4 css={prevNextLabelStyles}>Previous</h4>
            <span
              css={{
                [mediaQueries.md]: {
                  marginLeft: `-${space[4]}`,
                },
              }}
            >
              <ArrowBackIcon style={{ verticalAlign: `sub` }} />
              {prev.title}
            </span>
          </Link>
        )}
      </div>
      <div
        css={{
          textAlign: `right`,
          marginTop: space[5],
          [mediaQueries.sm]: { marginTop: 0, width: `50%` },
        }}
      >
        {next && (
          <Link to={next.link} css={prevNextLinkStyles}>
            <h4 css={prevNextLabelStyles}>Next</h4>
            <span
              css={{
                [mediaQueries.md]: {
                  marginRight: `-${space[4]}`,
                },
              }}
            >
              {next.title}
              <ArrowForwardIcon style={{ verticalAlign: `sub` }} />
            </span>
          </Link>
        )}
      </div>
    </nav>
  )
}

export default PrevAndNext
