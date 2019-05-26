import React from "react"
import styled from "@emotion/styled"
import { borders, fontFamily, fontWeight, letterSpacing } from "styled-system"

import { Flex } from "./system"

const BadgeBase = styled(Flex)(
  {
    display: `inline-flex`,
    position: `relative`,
    textTransform: `uppercase`,
  },
  borders,
  fontFamily,
  fontWeight,
  letterSpacing
)

BadgeBase.propTypes = {
  ...borders.propTypes,
  ...fontFamily.propTypes,
  ...fontWeight.propTypes,
  ...letterSpacing.propTypes,
}

BadgeBase.defaultProps = {
  alignItems: `center`,
  bg: `yellow.10`,
  border: 1,
  borderColor: `yellow.10`,
  borderRadius: 5,
  color: `yellow.90`,
  fontFamily: `system`,
  fontSize: 0,
  fontWeight: 0,
  letterSpacing: `tracked`,
  lineHeight: `solid`,
  py: 1,
  px: 2,
}

const Badge = ({ children, ...rest }) => (
  <BadgeBase {...rest}>{children}</BadgeBase>
)

export default Badge
