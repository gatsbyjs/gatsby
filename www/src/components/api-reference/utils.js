/** @jsx jsx */
import { jsx } from "theme-ui"
import styled from "@emotion/styled"

export const LinkBox = styled(`a`)`
  border-bottom: none !important;
  border-radius: ${p => p.theme.radii[1]};
  font-size: ${p => p.theme.fontSizes[0]} !important;
  color: ${p => p.theme.colors.text} !important;
  line-height: 22px;
  background: ${p => p.theme.colors.ui.background};
  margin-left: ${p => p.theme.space[1]};
  width: 22px;
  text-align: center;
  display: inline-block;
  &:hover {
    background: ${p => p.theme.colors.gatsby};
    color: ${p => p.theme.colors.white} !important;
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
