/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"

import styled from "@emotion/styled"

export const LinkBox = styled(`a`)`
  border-bottom: none !important;
  border-radius: ${props => props.theme.radii[1]}px;
  font-size: ${props => props.theme.fontSizes[0]} !important;
  color: ${props => props.theme.colors.text.primary} !important;
  line-height: 22px;
  background: ${props => props.theme.colors.ui.background};
  margin-left: ${props => props.theme.space[1]};
  width: 22px;
  text-align: center;
  display: inline-block;
  &:hover {
    background: ${props => props.theme.colors.gatsby};
    color: ${props => props.theme.colors.white} !important;
  }
`

export const Header = ({ children, level }) => {
  const Tag = `h${Math.min(3 + level * 2, 6)}`
  return <Tag sx={{ m: 0, ...(level > 0 ? { mt: 2 } : {}) }}>{children}</Tag>
}

export const SubHeader = ({ children, level }) => {
  const Tag = `h${Math.min(4 + level * 2, 6)}`
  return <Tag sx={{ m: 0, mt: 2 }}>{children}</Tag>
}
