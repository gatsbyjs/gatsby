/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { Link } from "gatsby"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"
import ArrowBackIcon from "react-icons/lib/md/arrow-back"

import { mediaQueries } from "../gatsby-plugin-theme-ui"

const prevNextLinkStyles = {
  // bump specificity to override the border applied to Link's by default
  "&&": {
    borderBottom: 0,
  },
  color: `gatsby`,
  fontFamily: `header`,
  fontSize: 3,
  fontWeight: `bold`,
  lineHeight: `dense`,
}
const prevNextLabelStyles = {
  color: `text.secondary`,
  fontSize: 2,
  fontWeight: `normal`,
  mb: 2,
  mt: 0,
}

const PrevAndNext = ({ prev = null, next = null, ...props }) => {
  if (!prev && !next) {
    return null
  }

  return (
    <nav
      aria-label="pagination"
      sx={{
        [mediaQueries.sm]: {
          display: `flex`,
          width: `100%`,
        },
      }}
      {...props}
    >
      <div css={{ [mediaQueries.sm]: { width: `50%` } }}>
        {prev && (
          <Link to={prev.link} sx={prevNextLinkStyles}>
            <h4 sx={prevNextLabelStyles}>Previous</h4>
            <span
              sx={{
                [mediaQueries.md]: {
                  marginLeft: t => `-${t.space[4]}`,
                },
              }}
            >
              <ArrowBackIcon sx={{ verticalAlign: `sub` }} />
              {prev.title}
            </span>
          </Link>
        )}
      </div>
      <div
        sx={{
          textAlign: `right`,
          mt: 5,
          [mediaQueries.sm]: { mt: 0, width: `50%` },
        }}
      >
        {next && (
          <Link to={next.link} sx={prevNextLinkStyles}>
            <h4 sx={prevNextLabelStyles}>Next</h4>
            <span
              sx={{
                [mediaQueries.md]: {
                  marginRight: t => `-${t.space[4]}`,
                },
              }}
            >
              {next.title}
              <ArrowForwardIcon sx={{ verticalAlign: `sub` }} />
            </span>
          </Link>
        )}
      </div>
    </nav>
  )
}

export default PrevAndNext
