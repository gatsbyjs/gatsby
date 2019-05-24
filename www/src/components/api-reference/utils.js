import React from "react"
import { css } from "@emotion/core"

import { colors, space, fontSizes } from "../../utils/presets"
import styled from "@emotion/styled"

export const LinkBox = styled(`a`)`
  border-bottom: none !important;
  font-size: ${fontSizes[0]} !important;
  color: ${colors.gray.copy} !important;
  line-height: 22px;
  background: ${colors.gray.superLight};
  margin-left: ${space[1]};
  width: 22px;
  text-align: center;
  display: inline-block;
  &:hover {
    background: ${colors.gatsby};
    color: ${colors.white} !important;
  }
`

export const Header = ({ children, level }) => {
  const Tag = `h${Math.min(3 + level * 2, 6)}`

  return (
    <Tag
      css={{
        margin: 0,
        ...(level > 0
          ? {
              marginTop: space[2],
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
        margin-top: ${space[2]};
      `}
    >
      {children}
    </Tag>
  )
}
