import React from "react"
import { css } from "@emotion/core"
import ChevronRight from "react-icons/lib/md/chevron-right"
import ChevronLeft from "react-icons/lib/md/chevron-left"

import Button from "../components/button"
import { space, colors } from "../utils/presets"

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

const PrevAndNext = ({ prev = null, next = null }) => {
  if (!prev && !next) {
    return null
  }

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
