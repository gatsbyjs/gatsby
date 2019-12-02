import React from "react"
import styled from "@emotion/styled"
import { border, typography, compose } from "styled-system"
import propTypes from "@styled-system/prop-types"

import { Flex } from "./system"

const styleProps = compose(border, typography)

const BadgeBase = styled(Flex)(
  {
    display: `inline-flex`,
    position: `relative`,
    textTransform: `uppercase`,
  },
  styleProps
)

BadgeBase.propTypes = {
  ...propTypes.border,
  ...propTypes.typography,
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
  fontWeight: `body`,
  letterSpacing: `tracked`,
  lineHeight: `solid`,
  py: 1,
  px: 2,
}

const Badge = ({ children, ...rest }) => (
  <BadgeBase {...rest}>{children}</BadgeBase>
)

export default Badge
