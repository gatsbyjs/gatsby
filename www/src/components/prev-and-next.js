import React from "react"
import { Link } from "gatsby"
import { css } from "@emotion/core"
import ChevronRight from "react-icons/lib/md/chevron-right"
import ChevronLeft from "react-icons/lib/md/chevron-left"
import ArrowForwardIcon from "react-icons/lib/md/arrow-forward"
import ArrowBackIcon from "react-icons/lib/md/arrow-back"

import Button from "../components/button"
import {
  colors,
  space,
  mediaQueries,
  lineHeights,
  fontSizes,
  fonts,
} from "../utils/presets"

const NavButton = ({ children, left = false, right = false, to }) => (
  <Button
    to={to}
    secondary
    css={css`
      border: 1px solid ${colors.ui.border.subtle} !important;
      justify-content: ${left ? `flex-start` : `flex-end`};
    `}
  >
    {left && <ChevronLeft />}
    {children}
    {right && <ChevronRight />}
  </Button>
)

const prevNextLinkStyles = {
  "&&": {
    borderBottom: 0,
    color: colors.gatsby,
    fontFamily: fonts.header,
    fontSize: fontSizes[3],
    fontWeight: `bold`,
    lineHeight: lineHeights.dense,
  },
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
    <div
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
    </div>
  )

  return (
    <div
      css={css`
        margin-top: ${space[12]};
        display: grid;
        grid-template-columns: ${prev && next ? `1fr 1fr` : `1fr`};
        grid-template-rows: 1fr;
        grid-gap: ${space[2]};
      `}
    >
      {prev && (
        <NavButton left to={prev.link} aria-label="Previous button">
          {prev.title}
        </NavButton>
      )}
      {next && (
        <NavButton right to={next.link} aria-label="Next button">
          {next.title}
        </NavButton>
      )}
    </div>
  )
}

export default PrevAndNext
