import React from "react"
import { css } from "@emotion/core"

import { rhythm } from "../../utils/typography"

export const Header = ({ children, level }) => {
  const Tag = `h${Math.min(3 + level * 2, 6)}`

  return (
    <Tag
      css={{
        margin: 0,
        ...(level > 0
          ? {
              marginTop: rhythm(0.35),
            }
          : {}),
      }}
    >
      {children}
    </Tag>
  )
}

export const SubHeader = ({ children, level }) => {
  const Tag = `h${Math.min(4 + level * 2, 6)}`
  return (
    <Tag
      css={css`
        margin: 0;
        margin-top: ${rhythm(0.35)};
      `}
    >
      {children}
    </Tag>
  )
}
